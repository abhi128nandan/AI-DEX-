import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { getSiteUrl } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;


    if (!email || !password) {
      console.warn(`[API] Registration failed - Missing critical credentials`);
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
      
      // Verification Test provided by the user
      const { data: testData, error: testError } = await adminClient.auth.admin.listUsers();

    } catch (envError: any) {
      console.error(`[API] Admin Client Initialization Error:`, envError.message);
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    // Step 1: Securely create user without triggering default Auth Email immediately
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,  // Block default email to allow Resend interception
    });

    if (createError) {
      if (createError.status === 422 && createError.message.includes('already registered')) {
         console.warn(`[API] Intercepted duplicate registration: ${email}`);
         return NextResponse.json({ success: false, message: 'User already exists. Try signing in or resending the verification email.' }, { status: 400 });
      }
      console.error(`[API] Fatal Supabase User Creation Error:`, JSON.stringify(createError, null, 2));
      return NextResponse.json({ success: false, message: createError.message }, { status: 400 });
    }

    const newUserId = userData?.user?.id;

    // Step 2: Generate specific cryptographically secure Validation URL
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
      options: {
        redirectTo: `${getSiteUrl()}auth/callback`
      }
    });

    if (linkError) {
      console.error(`[API] Verification Link Engine Failed:`, linkError);
      // Clean up the stranded user if link generation fails natively!
      if (newUserId) await adminClient.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ success: false, message: 'Failed to generate secure verification URL.' }, { status: 500 });
    }

    const { action_link } = linkData.properties;

    // Step 3: Attempt custom Transactional Email transmission via Resend
    let resendSuccess = false;
    let emailResponseData = null;

    try {
      const response = await resend.emails.send({
        from: 'AIDex Registration <onboarding@resend.dev>', // Replace with verified domain natively
        to: email, // Can be string or array
        subject: 'Verify your AIDex Account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1a1a24;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Welcome to AIDex!</h1>
            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              You just signed up for the ultimate AI Discovery Engine. Please verify your email to unlock your personalized dashboard.
            </p>
            <a href="${action_link}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
        `
      });

      if (response.error) {
        console.error(`[API] Resend API Validation Error:`, response.error);
      } else {
        resendSuccess = true;
        emailResponseData = response.data;
      }
    } catch (resendCrashError) {
      console.error(`[API] Exception inside Resend Try/Catch block:`, resendCrashError);
    }

    // Step 4 (FALLBACK PROCEDURE): What if Resend silenty fails/crashes
    if (!resendSuccess) {
      console.warn(`[API] ⚠️ RESEND SDK FAILED OR THREW AN ERROR.`);
      
      // Safety scrub: Wipe the ghost user so we can cleanly fire normal sign_up natively sending default emails!
      if (newUserId) {
         const { error: scrubError } = await adminClient.auth.admin.deleteUser(newUserId);
         if (scrubError) console.error(`[API] Failed to scrub user during fallback:`, scrubError);
      }

      // Execute Fallback: Trigger standard Supabase routing exactly using ANON client to force email!
      try {
        const anonClient = await createClient();
        const { data: fallbackData, error: fallbackError } = await anonClient.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${getSiteUrl()}auth/callback`
            }
        });
        
        if (fallbackError) {
            console.error(`[API] FATAL: Supabase fallback execution failed:`, fallbackError);
            return NextResponse.json({ success: false, message: 'Core architecture failure. Both Resend and Supabase backend failed.' }, { status: 500 });
        }
        
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Secure verification HTML delivered successfully! Check your inbox.',
      delivery_id: emailResponseData?.id 
    }, { status: 200 });

  } catch (err: any) {
    console.error(`[API] Critical Architecture Runtime Crash:`, err);
    return NextResponse.json({ success: false, message: 'Internal server boundary collapsed safely.' }, { status: 500 });
  }
}
