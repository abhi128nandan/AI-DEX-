import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      console.warn(`[API] Resend failed - Missing email`);
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }
    


    // Generate Verification Link via Admin API
    const adminClient = createAdminClient();

    // Supabase-backed rate limit — survives server restarts
    const COOLDOWN_SECONDS = 60;
    const { data: recentLink } = await adminClient
      .from('auth_rate_limits')
      .select('created_at')
      .eq('email', email)
      .eq('action', 'resend')
      .gte('created_at', new Date(Date.now() - COOLDOWN_SECONDS * 1000).toISOString())
      .maybeSingle();

    if (recentLink) {
      return NextResponse.json(
        { success: false, message: 'Please wait a minute before requesting another email.' },
        { status: 429 }
      );
    }
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
      from: process.env.EMAIL_FROM || 'AIDex Auth <onboarding@resend.dev>',
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
      
      try {
        const anonClient = await createClient();
        const { error: fallbackError } = await anonClient.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${getSiteUrl()}auth/callback`
            }
        });
        
        if (fallbackError) {
            console.error(`[API] FATAL: Supabase fallback execution failed:`, fallbackError);
            return NextResponse.json({ success: false, message: 'Core architecture failure. Both Resend and Supabase backend failed.' }, { status: 500 });
        }
        
        // Record this send for rate limiting
        await adminClient
          .from('auth_rate_limits')
          .insert({ email, action: 'resend', created_at: new Date().toISOString() })
          .then(() => {}); // fire-and-forget
          
        return NextResponse.json({ 
            success: true, 
            message: 'Custom mailer unavailable. Successfully triggered default fallback routing!',
            delivery_id: 'supabase_fallback_system'
        }, { status: 200 });

      } catch(fallbackErr) {
        console.error(`[API] Error during fallback processing:`, fallbackErr);
        return NextResponse.json({ success: false, message: 'Severe network failure catching safety payload.' }, { status: 500 });
      }
    }

    
    // Record this send for rate limiting
    await adminClient
      .from('auth_rate_limits')
      .insert({ email, action: 'resend', created_at: new Date().toISOString() })
      .then(() => {}); // fire-and-forget

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

