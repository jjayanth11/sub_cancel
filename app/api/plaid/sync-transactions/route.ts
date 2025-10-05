import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// Helper function to detect if transaction is recurring
function isRecurring(transactions: any[], merchantName: string): boolean {
  const sameMerchant = transactions.filter(t => t.merchant_name === merchantName);
  return sameMerchant.length >= 2; // Found at least 2 transactions
}

// Helper function to categorize subscription
function categorizeSubscription(merchantName: string): string {
  const categories: { [key: string]: string[] } = {
    'Entertainment': ['netflix', 'hulu', 'disney', 'hbo', 'spotify', 'apple music', 'youtube'],
    'Software': ['adobe', 'microsoft', 'google', 'dropbox', 'github'],
    'AI Tools': ['openai', 'chatgpt', 'anthropic', 'claude'],
    'Health': ['gym', 'fitness', 'peloton', 'headspace', 'calm'],
    'News': ['nytimes', 'wsj', 'washington post'],
  };

  const lowerMerchant = merchantName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

// Helper function to get emoji for subscription
function getSubscriptionEmoji(merchantName: string, category: string): string {
  const lowerMerchant = merchantName.toLowerCase();
  
  const emojiMap: { [key: string]: string } = {
    'netflix': '🎬', 'hulu': '📺', 'disney': '🏰', 'spotify': '🎵',
    'apple': '🍎', 'adobe': '🎨', 'chatgpt': '🤖', 'openai': '🤖',
    'gym': '💪', 'peloton': '🚴', 'github': '🐙',
  };

  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerMerchant.includes(keyword)) return emoji;
  }

  // Category fallback emojis
  const categoryEmojis: { [key: string]: string } = {
    'Entertainment': '🎬', 'Software': '💻', 'AI Tools': '🤖',
    'Health': '💪', 'News': '📰', 'Other': '💳',
  };

  return categoryEmojis[category] || '💳';
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user and access token
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, plaid_access_token')
      .eq('clerk_user_id', userId)
      .single();

    if (!user || !user.plaid_access_token) {
      return NextResponse.json({ error: 'No bank connected' }, { status: 400 });
    }

    // Get last 90 days of transactions
    const now = new Date();
    const startDate = new Date(now.setDate(now.getDate() - 90));
    
    const response = await plaidClient.transactionsGet({
      access_token: user.plaid_access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });

    const transactions = response.data.transactions;

    // Group transactions by merchant
    const merchantGroups: { [key: string]: any[] } = {};
    
    transactions.forEach(transaction => {
      if (transaction.amount > 0) { // Only debits (money out)
        const merchant = transaction.merchant_name || transaction.name || 'Unknown';
        if (!merchantGroups[merchant]) {
          merchantGroups[merchant] = [];
        }
        merchantGroups[merchant].push(transaction);
      }
    });

    // Detect recurring subscriptions
    const detectedSubscriptions = [];

    for (const [merchant, merchantTransactions] of Object.entries(merchantGroups)) {
      if (isRecurring(transactions, merchant)) {
        // Calculate average amount
        const amounts = merchantTransactions.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

        // Get most recent transaction
        const latest = merchantTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        const category = categorizeSubscription(merchant);
        const emoji = getSubscriptionEmoji(merchant, category);

        // Check if subscription already exists
        const { data: existing } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('merchant_name', merchant)
          .single();

        if (!existing) {
          // Insert new subscription
          const { data: newSub } = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: user.id,
              name: merchant,
              merchant_name: merchant,
              amount: avgAmount.toFixed(2),
              category,
              logo_emoji: emoji,
              billing_cycle: 'monthly',
              status: 'active',
              plaid_transaction_id: latest.transaction_id,
            })
            .select()
            .single();

          detectedSubscriptions.push(newSub);
        }
      }
    }

    return NextResponse.json({
      success: true,
      detected: detectedSubscriptions.length,
      subscriptions: detectedSubscriptions,
    });
  } catch (error: any) {
    console.error('Error syncing transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}