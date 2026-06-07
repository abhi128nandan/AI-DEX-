import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteUrl } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// Extremely rudimentary rate-limiting cache (In-memory, resets on server spin-down)
// For true production, map this to Redis or Supabase edge tables.
const RESEND_COOLDOWN_MAP = new Map<string, number>();
const COOLDOWN_MS = 60000; // 60 seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      console.warn(`[API] Resend failed - Missing email`);
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }
    
    // Primitive Rate Limiting Check
    const lastRequest = RESEND_COOLDOWN_MAP.get(email);
    if (lastRequest && Date.now() - lastRequest < COOLDOWN_MS) {
       console.warn(`[API] Rate limit hit for ${email}. Re-try in ${Math.round((COOLDOWN_MS - (Date.now() - lastRequest))/1000)} seconds.`);
       return NextResponse.json({ success: false, message: 'Please wait a minute before requesting another email.' }, { status: 429 });
    }

    // Generate Verification Link via Admin API
    const adminClient = createAdminClient();
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${getSiteUrl()}auth/callback`
      }
    });

    if (linkError) {
      console.error(`[API] Failed to generate magic link for ${email}:`, linkError);
      return NextResponse.json({ success: false, message: 'Could not generate identity link. Are you sure you registered?' }, { status: 400 });
    }

    const { action_link } = linkData.properties;
    const { data: emailData, error: resendError } = await resend.emails.send({
      from: 'AIDex Auth <onboarding@resend.dev>',
      to: [email],
      subject: 'Your AIDex Magic Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a1a24;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Login to AIDex</h1>
          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
            Here is your secure magic link to access your account.
          </p>
          <a href="${action_link}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Sign In Now
          </a>
        </div>
      `
    });

    if (resendError) {
      console.error(`[API] Resend API failed:`, resendError);
      return NextResponse.json({ success: false, message: resendError.message }, { status: 500 });
    }

    
    // Cache the cooldown locally
    RESEND_COOLDOWN_MAP.set(email, Date.now());

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent successfully! Please check your inbox.', 
      delivery_id: emailData?.id 
    }, { status: 200 });

  } catch (err: any) {
    console.error(`[API] Critical Internal Server Error processing resend:`, err);
    return NextResponse.json({ success: false, message: 'Internal server error processing resend.' }, { status: 500 });
  }
}
