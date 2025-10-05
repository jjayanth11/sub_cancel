'use client';

import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2 } from 'lucide-react';

interface PlaidLinkProps {
  onSuccess: () => void;
}

export default function PlaidLink({ onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSuccessCallback = useCallback(async (public_token: string) => {
    setLoading(true);
    try {
      // Exchange public token for access token
      await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });

      // Sync transactions
      await fetch('/api/plaid/sync-transactions', { method: 'POST' });

      onSuccess();
    } catch (error) {
      console.error('Error connecting bank:', error);
      alert('Failed to connect bank. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = async () => {
    if (!linkToken) {
      // Get link token
      setLoading(true);
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        setLinkToken(data.link_token);
        
        // Wait a moment for state to update, then open
        setTimeout(() => open(), 100);
      } catch (error) {
        console.error('Error creating link token:', error);
        alert('Failed to initialize bank connection. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      open();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <span>Connect Bank Account (Plaid)</span>
      )}
    </button>
  );
}