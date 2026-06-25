import { NextResponse } from 'next/server';
import { createClient as createSSRClient } from '@/lib/supabase/server';
import { validateUUID } from '@/lib/validators/uuid';

/**
 * Vote API Endpoint
 * 
 * Handles all voting operations with concurrency safety:
 * - UNIQUE(user_id, tool_id) constraint prevents duplicate votes
 * - Database is single source of truth for vote counts
 * - Atomic RPC operations prevent race conditions
 * - Server-side UUID validation ensures data integrity
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolId, voteType } = body;

    // Validate input
    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid toolId' }, { status: 400 });
    }
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ success: false, message: 'Invalid voteType' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSSRClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Validate UUID formats
    const userIdValidation = validateUUID(userId, 'userId');
    if (!userIdValidation.isValid) {
      return NextResponse.json({ success: false, message: 'Invalid user ID format' }, { status: 400 });
    }

    const toolIdValidation = validateUUID(toolId, 'toolId');
    if (!toolIdValidation.isValid) {
      return NextResponse.json({ success: false, message: 'Invalid tool ID format' }, { status: 400 });
    }

    // ATOMIC OPERATION: Call RPC function (vote + count in ONE transaction)
    const { data: result, error: rpcError } = await supabase
      .rpc('handle_vote', {
        p_user_id: userId,
        p_tool_id: toolId,
        p_vote_type: voteType
      });

    if (rpcError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API /api/votes] RPC failed:', rpcError.message);
      }
      return NextResponse.json({
        success: false,
        message: 'Failed to process vote',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        userVote: result.uservote,
        operation: result.operation
      }
    });

  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API /api/votes] Error:', err.message);
    }
    return NextResponse.json({
      success: false,
      message: 'Internal Server Error',
    }, { status: 500 });
  }
}

