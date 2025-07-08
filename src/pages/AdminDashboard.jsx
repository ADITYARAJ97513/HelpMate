// ... imports remain unchanged
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Users, Ticket, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.category) queryParams.append('category', filter.category);
      if (filter.priority) queryParams.append('priority', filter.priority);

      const ticketsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }

      const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTickets(tickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-rose-100 text-rose-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-violet-800">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 text-sm">Track tickets, users and manage status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        {[
          { icon: Ticket, label: 'Total Tickets', count: stats.totalTickets, color: 'bg-indigo-100 text-indigo-800' },
          { icon: AlertCircle, label: 'Open', count: stats.openTickets, color: 'bg-rose-100 text-rose-800' },
          { icon: Clock, label: 'In Progress', count: stats.inProgressTickets, color: 'bg-amber-100 text-amber-800' },
          { icon: CheckCircle, label: 'Resolved', count: stats.resolvedTickets, color: 'bg-emerald-100 text-emerald-800' },
          { icon: Users, label: 'Total Users', count: stats.totalUsers, color: 'bg-purple-100 text-purple-800' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-5 rounded-lg shadow-md ${stat.color} flex items-center space-x-4`}>
            <stat.icon className="w-7 h-7" />
            <div>
              <p className="text-sm font-semibold">{stat.label}</p>
              <p className="text-xl font-bold">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { value: filter.status, name: 'status', options: ['All Status', 'open', 'in_progress', 'resolved'] },
          { value: filter.category, name: 'category', options: ['All Categories', 'technical', 'account', 'billing', 'feature'] },
          { value: filter.priority, name: 'priority', options: ['All Priorities', 'high', 'medium', 'low'] },
        ].map((item, i) => (
          <select
            key={i}
            value={item.value}
            onChange={(e) => setFilter(prev => ({ ...prev, [item.name]: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {item.options.map((opt, i) => (
              <option key={i} value={opt === item.options[0] ? '' : opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-100 to-violet-100 border-b">
          <h3 className="text-lg font-semibold text-violet-800">All Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                {['Ticket', 'User', 'Category', 'Priority', 'Status', 'Created', 'Actions'].map((th, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-bold text-indigo-800 uppercase tracking-wider">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">{ticket.userName}</div>
                    <div className="text-xs text-gray-500">{ticket.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-indigo-400 ${getStatusColor(ticket.status)}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center px-6 py-6 text-gray-400">No tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
