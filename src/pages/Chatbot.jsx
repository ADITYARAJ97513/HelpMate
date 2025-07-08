import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bot, User, Send, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Chatbot() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: "Hello! I'm here to help you create a support ticket. Let's start by understanding your issue. What type of problem are you experiencing?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [currentStep, setCurrentStep] = useState('category');
  const [ticketData, setTicketData] = useState({
    category: '',
    priority: '',
    title: '',
    description: ''
  });
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMessage = (content, sender) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleCategorySelection = (category) => {
    addMessage(category, 'user');
    setTicketData(prev => ({ ...prev, category }));
    
    setTimeout(() => {
      addMessage("Thanks! Now, how urgent is this issue?", 'bot');
      setCurrentStep('priority');
    }, 500);
  };

  const handlePrioritySelection = (priority) => {
    addMessage(priority, 'user');
    setTicketData(prev => ({ ...prev, priority }));
    
    setTimeout(() => {
      addMessage("Great! Please provide a brief title for your issue:", 'bot');
      setCurrentStep('title');
    }, 500);
  };

  const handleTitleSubmit = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, 'user');
    setTicketData(prev => ({ ...prev, title: inputValue }));
    setInputValue('');
    
    setTimeout(() => {
      addMessage("Perfect! Now please describe your issue in detail. Include any relevant information that might help us resolve it:", 'bot');
      setCurrentStep('description');
    }, 500);
  };

  const handleDescriptionSubmit = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, 'user');
    setTicketData(prev => ({ ...prev, description: inputValue }));
    setInputValue('');
    
    setTimeout(() => {
      addMessage("Excellent! I have all the information I need. Let me create your support ticket now.", 'bot');
      setCurrentStep('submit');
      submitTicket();
    }, 500);
  };

  const submitTicket = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        setTimeout(() => {
          addMessage("✅ Your ticket has been created successfully! You can view it in your dashboard. Our support team will respond soon.", 'bot');
          setCurrentStep('completed');
        }, 1000);
      } else {
        setTimeout(() => {
          addMessage("❌ Sorry, there was an error creating your ticket. Please try again or create a ticket manually.", 'bot');
          setCurrentStep('error');
        }, 1000);
      }
    } catch (error) {
      setTimeout(() => {
        addMessage("❌ Network error. Please check your connection and try again.", 'bot');
        setCurrentStep('error');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategorySelection('Technical Issue')}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Technical Issue
            </button>
            <button
              onClick={() => handleCategorySelection('Account Support')}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              Account Support
            </button>
            <button
              onClick={() => handleCategorySelection('Billing Question')}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Billing Question
            </button>
            <button
              onClick={() => handleCategorySelection('Feature Request')}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Feature Request
            </button>
          </div>
        );
        
      case 'priority':
        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePrioritySelection('Low Priority')}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              Low Priority - General question
            </button>
            <button
              onClick={() => handlePrioritySelection('Medium Priority')}
              className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Medium Priority - Standard issue
            </button>
            <button
              onClick={() => handlePrioritySelection('High Priority')}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
            >
              High Priority - Urgent issue
            </button>
          </div>
        );
        
      case 'title':
        return (
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              placeholder="Enter a brief title..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTitleSubmit}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        );
        
      case 'description':
        return (
          <div className="space-y-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleDescriptionSubmit}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Description
            </button>
          </div>
        );
        
      case 'submit':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Creating your ticket...</span>
          </div>
        );
        
      case 'completed':
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Ticket created successfully!</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Another Ticket
              </button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/create-ticket')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Ticket Manually
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chat Support</h1>
        <p className="mt-2 text-gray-600">Let our chatbot guide you through creating a support ticket</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="h-96 overflow-y-auto mb-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'bot' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.sender === 'bot' ? 'Support Bot' : 'You'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}