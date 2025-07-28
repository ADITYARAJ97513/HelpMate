import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
    this.initTables();
    this.seedData();
  }

  initTables() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          status TEXT DEFAULT 'open',
          userId TEXT NOT NULL,
          attachment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          ticketId TEXT NOT NULL,
          userId TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticketId) REFERENCES tickets (id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);
    });
  }

  async seedData() {
    const row = await getAsync(this.db, "SELECT COUNT(*) as count FROM users");
    if (row.count === 0) {
      await this.createInitialData();
    }
  }

  async createInitialData() {
    const users = [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin'
      },
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user'
      }
    ];

    for (const user of users) {
      await runAsync(this.db,
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, user.password, user.role]
      );
    }
  }

  async createUser({ name, email, password, role }) {
    const id = uuidv4();
    await runAsync(this.db,
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, password, role]
    );
    return { id, name, email, role };
  }

  async findUser(query) {
    const { email, id } = query;
    if (email) return await getAsync(this.db, "SELECT * FROM users WHERE email = ?", [email]);
    if (id) return await getAsync(this.db, "SELECT * FROM users WHERE id = ?", [id]);
    return null;
  }

  async createTicket({ title, description, category, priority, userId, status, attachment }) {
    const id = uuidv4();
    await runAsync(this.db,
      "INSERT INTO tickets (id, title, description, category, priority, userId, status, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title, description, category, priority, userId, status, attachment ? JSON.stringify(attachment) : null]
    );
    return await this.getTicketById(id);
  }

  async getAllTickets() {
    const rows = await allAsync(this.db, `
      SELECT t.*, u.name as userName, u.email as userEmail 
      FROM tickets t 
      JOIN users u ON t.userId = u.id 
      ORDER BY t.created_at DESC
    `);
    return rows.map(row => ({
      ...row,
      attachment: row.attachment ? JSON.parse(row.attachment) : null
    }));
  }

  async getTicketsByUser(userId) {
    const rows = await allAsync(this.db, `
      SELECT * FROM tickets WHERE userId = ? ORDER BY created_at DESC
    `, [userId]);
    return rows.map(row => ({
      ...row,
      attachment: row.attachment ? JSON.parse(row.attachment) : null
    }));
  }

  async getTicketById(id) {
    const row = await getAsync(this.db, `
      SELECT t.*, u.name as userName, u.email as userEmail
      FROM tickets t JOIN users u ON t.userId = u.id
      WHERE t.id = ?
    `, [id]);
    if (!row) return null;
    return {
      ...row,
      attachment: row.attachment ? JSON.parse(row.attachment) : null
    };
  }

  async updateTicket(id, { status }) {
    await runAsync(this.db,
      "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );
    return await this.getTicketById(id);
  }

  async createComment({ ticketId, userId, content }) {
    const id = uuidv4();
    await runAsync(this.db,
      "INSERT INTO comments (id, ticketId, userId, content) VALUES (?, ?, ?, ?)",
      [id, ticketId, userId, content]
    );
    return { id, ticketId, userId, content };
  }

  async getCommentsByTicket(ticketId) {
    return await allAsync(this.db, `
      SELECT c.*, u.name as userName, u.role as userRole
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.ticketId = ?
      ORDER BY c.created_at ASC
    `, [ticketId]);
  }

  async getStats() {
    const stats = {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      totalUsers: 0
    };

    stats.totalTickets = (await getAsync(this.db, "SELECT COUNT(*) as count FROM tickets")).count;
    stats.openTickets = (await getAsync(this.db, "SELECT COUNT(*) as count FROM tickets WHERE status = 'open'")).count;
    stats.inProgressTickets = (await getAsync(this.db, "SELECT COUNT(*) as count FROM tickets WHERE status = 'in_progress'")).count;
    stats.resolvedTickets = (await getAsync(this.db, "SELECT COUNT(*) as count FROM tickets WHERE status = 'resolved'")).count;
    stats.totalUsers = (await getAsync(this.db, "SELECT COUNT(*) as count FROM users WHERE role = 'user'")).count;

    return stats;
  }


  async deleteTicket(ticketId) {
    return runAsync(this.db, "DELETE FROM tickets WHERE id = ?", [ticketId]);
  }

  async deleteCommentsByTicket(ticketId) {
    return runAsync(this.db, "DELETE FROM comments WHERE ticketId = ?", [ticketId]);
  }
}
