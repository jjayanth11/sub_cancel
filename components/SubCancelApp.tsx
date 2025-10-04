'use client';

import React, { useState } from 'react';
import { CreditCard, AlertCircle, DollarSign, TrendingUp, Bell, X, Check, ExternalLink, Menu, Calendar, User } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

const SubCancelApp = () => {
  const { isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [connectedBank, setConnectedBank] = useState(false);

  const subscriptions = [
    { id: 1, name: 'Netflix', amount: 15.99, nextBilling: '2025-10-15', category: 'Entertainment', status: 'active', logo: '🎬' },
    { id: 2, name: 'Spotify', amount: 9.99, nextBilling: '2025-10-08', category: 'Music', status: 'active', logo: '🎵' },
    { id: 3, name: 'Adobe Creative', amount: 54.99, nextBilling: '2025-10-20', category: 'Software', status: 'active', logo: '🎨' },
    { id: 4, name: 'ChatGPT Plus', amount: 20.00, nextBilling: '2025-10-12', category: 'AI Tools', status: 'active', logo: '🤖' },
    { id: 5, name: 'Gym Membership', amount: 45.00, nextBilling: '2025-10-05', category: 'Health', status: 'active', logo: '💪' },
  ];

  const trials = [
    { id: 1, name: 'Grammarly Premium', endsIn: 3, amount: 12.00, logo: '✍️' },
    { id: 2, name: 'Notion Pro', endsIn: 7, amount: 10.00, logo: '📝' },
  ];

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalYearly = totalMonthly * 12;

  const connectPlaid = () => {
    setConnectedBank(true);
  };

  const requestCancellation = (subName: string) => {
    alert(`Cancellation request submitted for ${subName}. Our team will help you cancel within 24 hours!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SubCancel
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`font-medium ${activeTab === 'dashboard' ? 'text-purple-600' : 'text-gray-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('subscriptions')}
                className={`font-medium ${activeTab === 'subscriptions' ? 'text-purple-600' : 'text-gray-600'}`}
              >
                Subscriptions
              </button>
              <button 
                onClick={() => setActiveTab('trials')}
                className={`font-medium ${activeTab === 'trials' ? 'text-purple-600' : 'text-gray-600'}`}
              >
                Trials
              </button>
              
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="text-gray-600 hover:text-gray-900 font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </nav>
            
            <div className="lg:hidden flex items-center space-x-2">
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>
          </div>
        </div>
        
        {showMenu && (
          <div className="lg:hidden border-t bg-white">
            <nav className="flex flex-col p-4 space-y-2">
              <button 
                onClick={() => { setActiveTab('dashboard'); setShowMenu(false); }}
                className={`text-left p-2 rounded ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveTab('subscriptions'); setShowMenu(false); }}
                className={`text-left p-2 rounded ${activeTab === 'subscriptions' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
              >
                Subscriptions
              </button>
              <button 
                onClick={() => { setActiveTab('trials'); setShowMenu(false); }}
                className={`text-left p-2 rounded ${activeTab === 'trials' ? 'bg-purple-50 text-purple-600' : 'text-gray-600'}`}
              >
                Trials
              </button>
              
              {!isSignedIn && (
                <div className="pt-2 border-t space-y-2">
                  <SignInButton mode="modal">
                    <button className="w-full text-left p-2 text-gray-600 hover:bg-gray-50 rounded">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Rest of your component... (Dashboard, Subscriptions, Trials tabs) */}
      {/* Copy the rest from the artifact above */}
    </div>
  );
};

export default SubCancelApp;