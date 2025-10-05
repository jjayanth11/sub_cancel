import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';

// POST - Sync Clerk user to Supabase
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Upsert user in Supabase
  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  console.log('=== USER SYNC START ===');
  
  const { userId } = await auth();
  console.log('User ID from Clerk:', userId);
  
  if (!userId) {
    console.log('ERROR: No userId from Clerk');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  console.log('Current user:', user?.emailAddresses[0]?.emailAddress);
  
  if (!user) {
    console.log('ERROR: No user from Clerk');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  console.log('Attempting Supabase upsert...');
  
  try {
    const { data, error } = await supabase
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

    console.log('Supabase response - data:', data);
    console.log('Supabase response - error:', error);

    if (error) {
      console.log('ERROR from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('=== USER SYNC SUCCESS ===');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('CATCH ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}