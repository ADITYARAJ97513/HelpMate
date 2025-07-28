import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Send,
  Download,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function TicketDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else {
        setError("Failed to fetch ticket details");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: comment }),
        }
      );

      if (response.ok) {
        setComment("");
        fetchTicket();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add comment");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSubmittingComment(false);
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

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#E9F7F5] flex items-center justify-center text-center p-4">
        <div>
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The ticket you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-bold text-white uppercase bg-[#F47121] hover:bg-orange-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9F7F5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center space-x-2 text-gray-600 hover:text-[#F47121] font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#13A24B] break-words">
            {ticket.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>

              {ticket.attachment && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Attachment
                  </h3>
                  <a
                    href={`${import.meta.env.VITE_BACKEND_URL}${
                      ticket.attachment.path
                    }`}
                    download={ticket.attachment.originalname}
                    className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors"
                  >
                    <FileText className="h-6 w-6 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-[#13A24B]">
                        {ticket.attachment.originalname}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({(ticket.attachment.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Conversation
              </h2>

              <div className="space-y-6">
                {ticket.comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`flex items-start gap-3 ${
                      comment.userId === user.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        comment.userRole === "admin"
                          ? "bg-[#13A24B]"
                          : "bg-gray-300"
                      }`}
                    >
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`p-4 rounded-xl ${
                          comment.userId === user.id
                            ? "bg-[#F47121] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">
                            {comment.userName}
                          </span>
                          {comment.userRole === "admin" && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                comment.userId === user.id
                                  ? "bg-white/20"
                                  : "bg-[#13A24B]/20 text-[#13A24B]"
                              }`}
                            >
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      <p
                        className={`text-xs text-gray-400 mt-1 ${
                          comment.userId === user.id ? "text-right" : ""
                        }`}
                      >
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {ticket.comments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p>No comments yet. Be the first to reply!</p>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="mt-8 border-t pt-6"
              >
                <label
                  htmlFor="comment"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Add a Reply
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13A24B] focus:border-transparent transition"
                  placeholder="Type your comment here..."
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                <button
                  type="submit"
                  disabled={submittingComment || !comment.trim()}
                  className="mt-4 w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-bold text-white uppercase bg-[#F47121] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F47121] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {submittingComment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Comment
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Ticket Details
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Status</span>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Priority</span>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Category</span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 capitalize">
                    {ticket.category}
                  </span>
                </div>
                <div className="border-t my-4"></div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Created by</p>
                  <p className="text-gray-800">{ticket.userName}</p>
                  <p className="text-gray-500 text-xs">{ticket.userEmail}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 mb-1">Created on</p>
                  <p className="text-gray-800">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
