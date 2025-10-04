'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, DollarSign, TrendingUp, Bell, X, Check, ExternalLink, Menu, Calendar } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import PlaidLink from './PlaidLink';

const SubCancelApp = () => {
  const { isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [connectedBank, setConnectedBank] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync user and fetch subscriptions when signed in
  useEffect(() => {
    if (isSignedIn) {
      syncUser();
      fetchSubscriptions();
    }
  }, [isSignedIn]);

  const syncUser = async () => {
    try {
      await fetch('/api/users/sync', { method: 'POST' });
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      setSubscriptions(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setConnectedBank(true);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCancellation = async (subscriptionId: string, subName: string) => {
    try {
      const response = await fetch('/api/cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          notes: `User wants to cancel ${subName}`,
        }),
      });
      
      if (response.ok) {
        alert(`Cancellation request submitted for ${subName}. Our team will help you cancel within 24 hours!`);
      }
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      alert('Failed to submit cancellation request. Please try again.');
    }
  };

  const trials = [
    { id: 1, name: 'Grammarly Premium', endsIn: 3, amount: 12.00, logo: '✍️' },
    { id: 2, name: 'Notion Pro', endsIn: 7, amount: 10.00, logo: '📝' },
  ];

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
  const totalYearly = totalMonthly * 12;

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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!connectedBank && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Take Control of Your Subscriptions</h2>
                <p className="text-purple-100 mb-6">Connect your bank account to automatically track all recurring charges</p>
                <PlaidLink onSuccess={() => {
                  setConnectedBank(true);
                  fetchSubscriptions();
                }} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Monthly Spending</span>
                  <DollarSign className="text-purple-600 w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-gray-900">${totalMonthly.toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-1">${totalYearly.toFixed(2)}/year</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Active Subscriptions</span>
                  <TrendingUp className="text-blue-600 w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{subscriptions.length}</div>
                <div className="text-sm text-gray-500 mt-1">Across all accounts</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Trial Ending Soon</span>
                  <AlertCircle className="text-orange-600 w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{trials.length}</div>
                <div className="text-sm text-gray-500 mt-1">Action needed</div>
              </div>
            </div>

            {trials.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Bell className="text-orange-600 w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">Trial Periods Ending Soon</h3>
                    <div className="space-y-2">
                      {trials.map(trial => (
                        <div key={trial.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{trial.logo}</span>
                            <div>
                              <div className="font-medium text-gray-900">{trial.name}</div>
                              <div className="text-sm text-gray-600">Ends in {trial.endsIn} days · ${trial.amount}/mo after</div>
                            </div>
                          </div>
                          <button className="text-orange-600 text-sm font-medium hover:underline">
                            Remind Me
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {subscriptions.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Subscriptions</h3>
                  <button 
                    onClick={() => setActiveTab('subscriptions')}
                    className="text-purple-600 text-sm font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {subscriptions.slice(0, 3).map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{sub.logo_emoji || '💳'}</span>
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="text-sm text-gray-500">{sub.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${parseFloat(sub.amount).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">monthly</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Subscriptions</h2>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Monthly</div>
                <div className="text-2xl font-bold text-purple-600">${totalMonthly.toFixed(2)}</div>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500 mb-4">No subscriptions detected yet</p>
                <PlaidLink onSuccess={() => {
                  setConnectedBank(true);
                  fetchSubscriptions();
                }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{sub.logo_emoji || '💳'}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{sub.name}</h3>
                          <span className="text-sm text-gray-500">{sub.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">${parseFloat(sub.amount).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                    </div>
                    
                    {sub.next_billing_date && (
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Next billing: {sub.next_billing_date}</span>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => requestCancellation(sub.id, sub.name)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition text-sm"
                      >
                        Request Cancellation
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trials' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Trial Periods</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trials.map(trial => (
                <div key={trial.id} className="bg-white rounded-xl p-6 shadow-sm border-2 border-orange-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{trial.logo}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{trial.name}</h3>
                        <span className="text-orange-600 font-medium text-sm">Trial Period</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Trial ends in</div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">{trial.endsIn} days</div>
                    <div className="text-sm text-gray-600">Then ${trial.amount}/month</div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm flex items-center justify-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Keep Subscription</span>
                    </button>
                    <button 
                      onClick={() => alert('Trial cancellation feature coming soon!')}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-sm flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Never Forget a Trial Again</h3>
              <p className="text-blue-800 text-sm mb-4">
                We'll send you reminders 3 days before your trial ends, so you can decide whether to keep or cancel.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Enable Trial Reminders
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">Need Help Cancelling?</h3>
          <p className="text-gray-600 mb-4">Our team will handle the cancellation for you - no phone calls, no hassle.</p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            Get Cancellation Help
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SubCancelApp;