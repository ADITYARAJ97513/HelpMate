import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Clock, CheckCircle, AlertCircle, Plus, Eye } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.category) queryParams.append('category', filter.category);
      if (filter.priority) queryParams.append('priority', filter.priority);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-rose-100 text-rose-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-200 text-red-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎫 My Tickets</h1>
        <p className="text-gray-500 mt-1">Track and manage your support requests efficiently.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[{
          icon: <Ticket className="text-white" />,
          title: "Total Tickets",
          count: tickets.length,
          bg: "bg-gradient-to-r from-indigo-500 to-purple-600"
        }, {
          icon: <AlertCircle className="text-white" />,
          title: "Open",
          count: tickets.filter(t => t.status === 'open').length,
          bg: "bg-gradient-to-r from-rose-500 to-red-600"
        }, {
          icon: <Clock className="text-white" />,
          title: "In Progress",
          count: tickets.filter(t => t.status === 'in_progress').length,
          bg: "bg-gradient-to-r from-yellow-400 to-orange-500"
        }, {
          icon: <CheckCircle className="text-white" />,
          title: "Resolved",
          count: tickets.filter(t => t.status === 'resolved').length,
          bg: "bg-gradient-to-r from-green-500 to-emerald-600"
        }].map(({ icon, title, count, bg }, idx) => (
          <div key={idx} className={`p-6 rounded-xl shadow-md text-white ${bg} transition hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2 rounded-full">{icon}</div>
              <div>
                <p className="text-sm font-light">{title}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create + Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link
          to="/create-ticket"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
        <div className="flex flex-wrap gap-2">
          {['status', 'category', 'priority'].map((type, idx) => (
            <select
              key={idx}
              value={filter[type]}
              onChange={(e) => setFilter(prev => ({ ...prev, [type]: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {type.charAt(0).toUpperCase() + type.slice(1)}</option>
              {type === 'status' && ['open', 'in_progress', 'resolved'].map(v => <option key={v}>{v}</option>)}
              {type === 'category' && ['technical', 'account', 'billing', 'feature'].map(v => <option key={v}>{v}</option>)}
              {type === 'priority' && ['high', 'medium', 'low'].map(v => <option key={v}>{v}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-16 px-6 text-gray-500">
            <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No tickets found</h2>
            <p className="mb-4">Start by creating your first support ticket.</p>
            <Link
              to="/create-ticket"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 max-w-xs truncate">
                      <p className="font-medium text-gray-900">{ticket.title}</p>
                      <p className="text-gray-500 text-sm">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
