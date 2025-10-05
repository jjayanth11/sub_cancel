import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

const { data, error } = await supabaseAdmin  // Changed from supabase
  .from('users')
  .upsert({
    clerk_user_id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  }, {
    onConflict: 'clerk_user_id'
  })
  .select()
  .single();
  
// GET - Fetch user's subscriptions
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from database
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch subscriptions
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(subscriptions);
}

// POST - Add new subscription
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  // Get user from database
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Insert subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      name: body.name,
      amount: body.amount,
      billing_cycle: body.billing_cycle || 'monthly',
      category: body.category,
      logo_emoji: body.logo_emoji,
      next_billing_date: body.next_billing_date,
      status: body.status || 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}