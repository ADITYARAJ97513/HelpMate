import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react'; 

export default function FloatingChatbotButton() {
  return (
    <Link
      to="/chatbot"
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg animate-bounce transition-all duration-300 ease-in-out"
      title="Chat with Support"
    >
      <Bot className="w-6 h-6" />

    </Link>
  );
}
