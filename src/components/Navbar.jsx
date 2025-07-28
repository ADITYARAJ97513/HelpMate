import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  PlusCircle,
  MessageCircle,
  UserCog,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-md">
      <div className="bg-[#13A24B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-10">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
              {user.role === "admin" && (
                <span className="px-2 py-0.5 text-xs bg-white/30 text-white rounded-full">
                  Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F47121] p-1 rounded-md"
            >
              <img
                className="h-12 w-auto"
                src="/public/webtirety-logo.png"
                alt="Webtirety Software Logo"
              />

              <span className="text-2xl font-bold text-gray-800 tracking-tight">
                Webtirety
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-[#F47121] px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/chatbot"
              className="text-gray-700 hover:text-[#F47121] px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chat Support</span>
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-[#F47121] px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2"
              >
                <UserCog className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link
              to="/create-ticket"
              className="ml-4 inline-flex items-center px-5 py-2.5 text-sm font-bold text-white uppercase bg-[#F47121] hover:bg-orange-600 rounded-md shadow-sm transition-transform transform hover:scale-105"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Ticket
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
