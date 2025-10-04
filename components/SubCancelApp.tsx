'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, DollarSign, TrendingUp, Bell, X, Check, ExternalLink, Menu, Calendar, User } from 'lucide-react';
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
      setSubscriptions(data);
      if (data.length > 0) {
        setConnectedBank(true);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // KEEP ONLY THIS VERSION - the async one
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

  // Mock trials data (you can fetch this from API later)
  const trials = [
    { id: 1, name: 'Grammarly Premium', endsIn: 3, amount: 12.00, logo: '✍️' },
    { id: 2, name: 'Notion Pro', endsIn: 7, amount: 10.00, logo: '📝' },
  ];

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0);
  const totalYearly = totalMonthly * 12;

  return (
    // ... rest of your component
  );
};

export default SubCancelApp;