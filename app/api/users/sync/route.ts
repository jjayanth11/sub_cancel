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