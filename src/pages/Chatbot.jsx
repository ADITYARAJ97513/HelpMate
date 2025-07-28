import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bot, User, Send, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Chatbot() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: "Hello! I'm the Webtirety support bot. I can help you create a support ticket. To start, please select the category that best describes your issue.",
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setTicketData(prev => ({ ...prev, category: category.split(' ')[0].toLowerCase() }));
    
    setTimeout(() => {
      addMessage("Thank you. Now, please select the urgency of this issue.", 'bot');
      setCurrentStep('priority');
    }, 500);
  };

  const handlePrioritySelection = (priority) => {
    addMessage(priority, 'user');
    setTicketData(prev => ({ ...prev, priority: priority.split(' ')[0].toLowerCase() }));
    
    setTimeout(() => {
      addMessage("Got it. Please provide a short, clear title for your ticket.", 'bot');
      setCurrentStep('title');
    }, 500);
  };

  const handleTitleSubmit = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, 'user');
    setTicketData(prev => ({ ...prev, title: inputValue }));
    setInputValue('');
    
    setTimeout(() => {
      addMessage("Perfect. Lastly, please describe the issue in detail. The more information you provide, the faster we can help!", 'bot');
      setCurrentStep('description');
    }, 500);
  };

  const handleDescriptionSubmit = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, 'user');
    setTicketData(prev => ({ ...prev, description: inputValue }));
    setInputValue('');
    
    setTimeout(() => {
      addMessage("Excellent! I have all the necessary information. I will now create your support ticket.", 'bot');
      setCurrentStep('submit');
      submitTicket({ ...ticketData, description: inputValue });
    }, 500);
  };

  const submitTicket = async (finalTicketData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalTicketData),
      });

      if (response.ok) {
        setTimeout(() => {
          addMessage("✅ Your ticket has been created successfully! You'll be redirected to your dashboard shortly.", 'bot');
          setCurrentStep('completed');
          setTimeout(() => navigate('/dashboard'), 3000);
        }, 1000);
      } else {
        setTimeout(() => {
          addMessage("❌ We're sorry, but there was an error creating your ticket. Please try creating a ticket manually from your dashboard.", 'bot');
          setCurrentStep('error');
        }, 1000);
      }
    } catch (error) {
      setTimeout(() => {
        addMessage("❌ A network error occurred. Please check your internet connection and try again.", 'bot');
        setCurrentStep('error');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const buttonBaseStyle = "px-4 py-2 rounded-lg font-semibold border-2 transition-transform transform hover:scale-105";
    const categoryButtons = [
      { label: 'Technical Issue', style: 'border-blue-500 text-blue-600 hover:bg-blue-50' },
      { label: 'Account Support', style: 'border-green-500 text-green-600 hover:bg-green-50' },
      { label: 'Billing Question', style: 'border-yellow-500 text-yellow-600 hover:bg-yellow-50' },
      { label: 'Feature Request', style: 'border-purple-500 text-purple-600 hover:bg-purple-50' },
    ];
    const priorityButtons = [
        { label: 'Low Priority', style: 'border-green-500 text-green-600 hover:bg-green-50' },
        { label: 'Medium Priority', style: 'border-yellow-500 text-yellow-600 hover:bg-yellow-50' },
        { label: 'High Priority', style: 'border-red-500 text-red-600 hover:bg-red-50' },
    ];

    switch (currentStep) {
      case 'category':
        return (
          <div className="flex flex-wrap gap-3">
            {categoryButtons.map(btn => (
              <button key={btn.label} onClick={() => handleCategorySelection(btn.label)} className={`${buttonBaseStyle} ${btn.style}`}>
                {btn.label}
              </button>
            ))}
          </div>
        );
        
      case 'priority':
        return (
          <div className="flex flex-wrap gap-3">
            {priorityButtons.map(btn => (
              <button key={btn.label} onClick={() => handlePrioritySelection(btn.label)} className={`${buttonBaseStyle} ${btn.style}`}>
                {btn.label}
              </button>
            ))}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13A24B]"
            />
            <button
              onClick={handleTitleSubmit}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-[#F47121] text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        );
        
      case 'description':
        return (
          <div className="flex items-start space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={3}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13A24B]"
            />
            <button
              onClick={handleDescriptionSubmit}
              disabled={!inputValue.trim()}
              className="h-full px-4 py-2 bg-[#F47121] text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        );
        
      case 'submit':
        return (
          <div className="flex items-center space-x-2 text-[#13A24B] font-semibold">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#13A24B]"></div>
            <span>Creating your ticket...</span>
          </div>
        );
        
      case 'completed':
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-green-600 font-semibold">
              <CheckCircle className="h-5 w-5" />
              <span>Ticket created successfully! Redirecting...</span>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex space-x-3">
            <button onClick={() => navigate('/create-ticket')} className="px-4 py-2 bg-[#F47121] text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold">
              Create Manually
            </button>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
              Try Again
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E9F7F5] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
            <img 
              src="/webtirety-logo.png" 
              alt="Webtirety Software Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-[#13A24B]">Chat Support</h1>
            <p className="mt-1 text-gray-500">Let our chatbot guide you through creating a support ticket.</p>
             <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 inline-flex items-center space-x-2 text-gray-600 hover:text-[#F47121] font-semibold"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl">
          <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#13A24B] flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                )}
                <div
                  className={`max-w-sm md:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#F47121] text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                 {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}