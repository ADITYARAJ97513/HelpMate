// server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { Database } from './database.js';
import { authMiddleware } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

const db = new Database();

app.use(cors({
  origin: 'https://help-mate-six.vercel.app',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Only images and documents are allowed!'));
  }
});

// ---------------- AUTH ----------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const existingUser = await db.findUser({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({ name, email, password: hashedPassword, role });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'User created successfully', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUser({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- TICKETS ----------------
app.post('/api/tickets', authMiddleware, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const userId = req.user.userId;

    const ticketData = {
      title,
      description,
      category,
      priority: priority || 'medium',
      userId,
      status: 'open'
    };

    if (req.file) {
      ticketData.attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      };
    }

    const ticket = await db.createTicket(ticketData); // ✅ await added
    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tickets', authMiddleware, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let tickets;

    if (req.user.role === 'admin') {
      tickets = await db.getAllTickets(); // ✅ await added
    } else {
      tickets = await db.getTicketsByUser(req.user.userId); // ✅ await added
    }

    // Filtering
    if (status) tickets = tickets.filter(t => t.status === status);
    if (category) tickets = tickets.filter(t => t.category === category);
    if (priority) tickets = tickets.filter(t => t.priority === priority);

    res.json(tickets); // ✅ not wrapped inside { tickets }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comments = await db.getCommentsByTicket(req.params.id);
    res.json({ ...ticket, comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tickets/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const updatedTicket = await db.updateTicket(req.params.id, { status });
    res.json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- COMMENTS ----------------
app.post('/api/tickets/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const ticketId = req.params.id;
    const userId = req.user.userId;

    const ticket = await db.getTicketById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await db.createComment({ ticketId, userId, content });
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- ADMIN STATS ----------------
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const stats = await db.getStats(); // ✅ await added
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
