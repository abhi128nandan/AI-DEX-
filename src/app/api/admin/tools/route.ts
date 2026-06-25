import { NextResponse } from 'next/server';
import { createClient as createSSRClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin() {
  try {
    const supabase = await createSSRClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    
    if (authError || !user) {
      return false;
    }

    // Read-only profile check - no mutations
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();


    if (profileError) {
      console.error('[verifyAdmin] Profile query error:', profileError);
      return false;
    }

    if (!profile) {
      console.warn('[verifyAdmin] Profile missing for user:', user.id, 
        '- Run backfill query from supabase-production-fixes.sql');
      return false;
    }

    const isAdmin = profile.role === 'admin';
    
    return isAdmin;
  } catch (err: any) {
    console.error('[verifyAdmin] Unexpected error:', err.message, err.stack);
    return false;
  }
}

export async function GET(request: Request) {
  
  try {
    const isAdmin = await verifyAdmin();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Forbidden: Admin access required. Ensure your profile has role="admin".' 
      }, { status: 403 });
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const adminClient = createAdminClient();
    
    const startTime = Date.now();
    
    // Fetch total count for pagination
    const { count, error: countError } = await adminClient
      .from('tool_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (countError) {
      console.error("[ADMIN ROUTE] Count error:", countError);
      throw countError;
    }

    // Fetch paginated data with soft delete filter
    const { data, error } = await adminClient
      .from('tool_submissions')
      .select('*')
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.error("[SlowQuery]", { endpoint: '/api/admin/tools', duration, method: 'GET' });
    }

    if (error) {
      console.error("[ADMIN ROUTE] Database error:", error);
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({ 
      success: true, 
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages
      }
    }, { status: 200 });
  } catch (err: any) {
    console.error("[AdminAPIError]", { endpoint: '/api/admin/tools', method: 'GET', error: err.message, stack: err.stack });
    // CRITICAL: Always return JSON, never let Next.js return HTML error page
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let id: any;
  let action: any;
  
  try {
    const isAdmin = await verifyAdmin();
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Forbidden: Admin access required. Ensure your profile has role="admin".' 
      }, { status: 403 });
    }

    const body = await request.json();
    id = body.id;
    action = body.action;
    

    // Inline validation
    if (!id || typeof id !== 'string') {
      console.error("[ValidationError]", { endpoint: '/api/admin/tools', id, action });
      return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
    }
    if (!action || !['approve', 'reject'].includes(action)) {
      console.error("[ValidationError]", { endpoint: '/api/admin/tools', id, action });
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const startTime = Date.now();
    // Re-verify the tool exists in submission explicitly natively
    const { data: submission, error: fetchError } = await adminClient
      .from('tool_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    let duration = Date.now() - startTime;
    if (duration > 5000) {
      console.error("[SlowQuery]", { endpoint: '/api/admin/tools', duration, id, action, operation: 'fetch' });
    }

    if (fetchError || !submission) {
      console.error("[ADMIN ROUTE] Submission not found:", { id, error: fetchError });
      return NextResponse.json({ success: false, message: 'Submission not found.' }, { status: 404 });
    }

    if (action === 'reject') {
      const rejectStartTime = Date.now();
      const { error: updateError } = await adminClient
        .from('tool_submissions')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      duration = Date.now() - rejectStartTime;
      if (duration > 5000) {
        console.error("[SlowQuery]", { endpoint: '/api/admin/tools', duration, id, action, operation: 'reject' });
      }

      if (updateError) {
        console.error("[ADMIN ROUTE] Reject failed:", updateError);
        throw updateError;
      }
      
      return NextResponse.json({ success: true, message: 'Tool rejected successfully.' }, { status: 200 });
    }

    // Process Approval hook transferring generic payload to Live Tools explicitly natively
    if (action === 'approve') {
       const approveStartTime = Date.now();
       // Insert into Live Tools Table strictly
       const { error: insertError } = await adminClient
         .from('tools')
         .insert({
           name: submission.name,
           description: submission.description,
           website_url: submission.url,
           category: submission.category,
           tags: submission.tags,
           is_verified: true
         });

       if (insertError) {
         console.error("[ADMIN ROUTE] Insert to tools failed:", insertError);
         throw insertError;
       }

       // Toggle submission structure completely into completed arrays securely
       const { error: updateError } = await adminClient
         .from('tool_submissions')
         .update({ status: 'approved' })
         .eq('id', id);

       if (updateError) {
         console.error("[ADMIN ROUTE] Update submission status failed:", updateError);
         throw updateError;
       }
       
       duration = Date.now() - approveStartTime;
       if (duration > 5000) {
         console.error("[SlowQuery]", { endpoint: '/api/admin/tools', duration, id, action, operation: 'approve' });
       }
       
       return NextResponse.json({ success: true, message: 'Tool approved and published actively!' }, { status: 200 });
    }

  } catch (err: any) {
    console.error("[AdminAPIError]", { endpoint: '/api/admin/tools', id, action, error: err.message, stack: err.stack });
    // CRITICAL: Always return JSON, never let Next.js return HTML error page
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error processing request.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

