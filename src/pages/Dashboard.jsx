import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    category: "",
    priority: "",
  });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.category) queryParams.append("category", filter.category);
      if (filter.priority) queryParams.append("priority", filter.priority);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTickets(data || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#13A24B]">
          My Tickets Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Track and manage your support requests efficiently.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            icon: <Ticket className="text-[#13A24B]" />,
            title: "Total Tickets",
            count: tickets.length,
            color: "text-[#13A24B]",
          },
          {
            icon: <AlertCircle className="text-red-500" />,
            title: "Open",
            count: tickets.filter((t) => t.status === "open").length,
            color: "text-red-500",
          },
          {
            icon: <Clock className="text-blue-500" />,
            title: "In Progress",
            count: tickets.filter((t) => t.status === "in_progress").length,
            color: "text-blue-500",
          },
          {
            icon: <CheckCircle className="text-green-600" />,
            title: "Resolved",
            count: tickets.filter((t) => t.status === "resolved").length,
            color: "text-green-600",
          },
        ].map(({ icon, title, count, color }, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#13A24B] transition hover:shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gray-100">{icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link
          to="/create-ticket"
          className="inline-flex items-center px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-[#F47121] hover:bg-orange-600 rounded-md shadow-md transition-transform transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Ticket
        </Link>
        <div className="flex flex-wrap gap-3">
          {["status", "category", "priority"].map((type, idx) => (
            <select
              key={idx}
              value={filter[type]}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, [type]: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-[#13A24B] focus:border-[#13A24B] transition"
            >
              <option value="">
                All {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
              {type === "status" &&
                ["open", "in_progress", "resolved"].map((v) => (
                  <option key={v} value={v}>
                    {v.replace("_", " ")}
                  </option>
                ))}
              {type === "category" &&
                ["technical", "account", "billing", "feature"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              {type === "priority" &&
                ["high", "medium", "low"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
            </select>
          ))}
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-20 px-6 text-gray-500">
            <Ticket className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No tickets to display
            </h2>
            <p className="mb-6">
              Get started by creating your first support ticket.
            </p>
            <Link
              to="/create-ticket"
              className="inline-flex items-center px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-[#F47121] hover:bg-orange-600 rounded-md shadow-md transition-transform transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Title",
                    "Category",
                    "Priority",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
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
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-[#13A24B] hover:text-green-700 font-semibold flex items-center space-x-1"
                      >
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
