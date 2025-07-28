import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    category: "",
    priority: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.category) queryParams.append("category", filter.category);
      if (filter.priority) queryParams.append("priority", filter.priority);

      const ticketsResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }

      const statsResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setTickets(
          tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
          )
        );
        const statsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticketToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.id !== ticketToDelete)
        );
        fetchData();
      } else {
        console.error("Failed to delete the ticket.");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
    } finally {
      setShowDeleteModal(false);
      setTicketToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-[#13A24B]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#F47121]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <div className="mb-8 text-center">
          <img
            src="/webtirety-logo.png"
            alt="Webtirety Software Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-[#13A24B]">Admin Panel</h1>
          <p className="mt-1 text-gray-500">
            Oversee all support tickets and user activity.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {[
            {
              icon: Ticket,
              label: "Total Tickets",
              count: stats.totalTickets,
              color: "bg-blue-500",
            },
            {
              icon: AlertCircle,
              label: "Open",
              count: stats.openTickets,
              color: "bg-red-500",
            },
            {
              icon: Clock,
              label: "In Progress",
              count: stats.inProgressTickets,
              color: "bg-yellow-500",
            },
            {
              icon: CheckCircle,
              label: "Resolved",
              count: stats.resolvedTickets,
              color: "bg-green-600",
            },
            {
              icon: Users,
              label: "Total Users",
              count: stats.totalUsers,
              color: "bg-purple-500",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-[#13A24B] transition hover:shadow-lg flex items-center space-x-4"
            >
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center gap-4">
          <p className="text-sm font-semibold text-gray-600">Filters:</p>
          {[
            {
              value: filter.status,
              name: "status",
              options: ["All Status", "open", "in_progress", "resolved"],
            },
            {
              value: filter.category,
              name: "category",
              options: [
                "All Categories",
                "technical",
                "account",
                "billing",
                "feature",
              ],
            },
            {
              value: filter.priority,
              name: "priority",
              options: ["All Priorities", "high", "medium", "low"],
            },
          ].map((item, i) => (
            <select
              key={i}
              value={item.value}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  [item.name]: e.target.value.startsWith("All")
                    ? ""
                    : e.target.value,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-[#13A24B] focus:border-[#13A24B] transition"
            >
              {item.options.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          ))}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Ticket",
                    "User",
                    "Category",
                    "Priority",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((th) => (
                    <th
                      key={th}
                      className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-gray-800 truncate">
                        {ticket.title}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {ticket.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {ticket.userName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 capitalize">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          updateTicketStatus(ticket.id, e.target.value)
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border-none appearance-none focus:ring-2 focus:ring-[#13A24B] capitalize ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="text-[#13A24B] hover:text-green-700"
                          title="View Ticket"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setTicketToDelete(ticket.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Ticket"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center px-6 py-10 text-gray-400"
                    >
                      <Ticket className="h-12 w-12 mx-auto mb-2" />
                      No tickets match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Confirm Deletion
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to permanently delete this ticket? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="w-full px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
