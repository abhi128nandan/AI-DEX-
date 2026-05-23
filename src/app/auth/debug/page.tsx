"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [checks, setChecks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {};

    // Check 1: Environment variables
    results.envVars = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'MISSING',
    };

    // Check 2: Supabase client initialization
    try {
      results.clientInit = {
        success: !!supabase,
        hasAuth: !!supabase.auth,
      };
    } catch (err: any) {
      results.clientInit = {
        success: false,
        error: err.message,
      };
    }

    // Check 3: Session check
    try {
      const { data, error } = await supabase.auth.getSession();
      results.session = {
        success: !error,
        hasSession: !!data.session,
        userId: data.session?.user?.id || null,
        email: data.session?.user?.email || null,
        error: error?.message,
      };
    } catch (err: any) {
      results.session = {
        success: false,
        error: err.message,
      };
    }

    // Check 4: Test connection to Supabase
    try {
      const { data, error } = await supabase.from('tools').select('id').limit(1);
      results.dbConnection = {
        success: !error,
        canQuery: !!data,
        error: error?.message,
      };
    } catch (err: any) {
      results.dbConnection = {
        success: false,
        error: err.message,
      };
    }

    // Check 5: Auth settings
    try {
      const { data, error } = await supabase.auth.getUser();
      results.authSettings = {
        success: !error,
        hasUser: !!data.user,
        error: error?.message,
      };
    } catch (err: any) {
      results.authSettings = {
        success: false,
        error: err.message,
      };
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    ) : (
      <XCircle className="w-5 h-5 text-red-400" />
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Supabase Auth Diagnostics</h1>
          <p className="text-slate-400">Debug authentication configuration and connection</p>
        </div>

        <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Environment Variables */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checks.envVars?.hasUrl && checks.envVars?.hasAnonKey)}
                  <h2 className="text-xl font-bold text-white">Environment Variables</h2>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.envVars?.hasUrl)}
                    <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_URL:</span>
                    <code className="text-purple-400 bg-black/40 px-2 py-1 rounded">
                      {checks.envVars?.url || 'MISSING'}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.envVars?.hasAnonKey && checks.envVars?.anonKeyLength > 100)}
                    <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                    <code className="text-purple-400 bg-black/40 px-2 py-1 rounded">
                      {checks.envVars?.anonKeyPrefix}... (length: {checks.envVars?.anonKeyLength})
                    </code>
                  </div>
                  {checks.envVars?.anonKeyLength < 100 && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs">
                        ⚠️ Anon key appears invalid (too short). Expected length: 200+ characters.
                        <br />
                        Please check your .env.local file and ensure you copied the full key from Supabase Dashboard.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Initialization */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checks.clientInit?.success)}
                  <h2 className="text-xl font-bold text-white">Supabase Client</h2>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.clientInit?.success)}
                    <span className="text-slate-300">Client initialized:</span>
                    <span className="text-purple-400">{checks.clientInit?.success ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.clientInit?.hasAuth)}
                    <span className="text-slate-300">Auth module available:</span>
                    <span className="text-purple-400">{checks.clientInit?.hasAuth ? 'Yes' : 'No'}</span>
                  </div>
                  {checks.clientInit?.error && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs">Error: {checks.clientInit.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Check */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checks.session?.success)}
                  <h2 className="text-xl font-bold text-white">Session Status</h2>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.session?.success)}
                    <span className="text-slate-300">Can check session:</span>
                    <span className="text-purple-400">{checks.session?.success ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">Currently logged in:</span>
                    <span className="text-purple-400">{checks.session?.hasSession ? 'Yes' : 'No'}</span>
                  </div>
                  {checks.session?.hasSession && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">User ID:</span>
                        <code className="text-purple-400 bg-black/40 px-2 py-1 rounded text-xs">
                          {checks.session.userId}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">Email:</span>
                        <code className="text-purple-400 bg-black/40 px-2 py-1 rounded text-xs">
                          {checks.session.email}
                        </code>
                      </div>
                    </>
                  )}
                  {checks.session?.error && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs">Error: {checks.session.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Database Connection */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checks.dbConnection?.success)}
                  <h2 className="text-xl font-bold text-white">Database Connection</h2>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.dbConnection?.success)}
                    <span className="text-slate-300">Can query database:</span>
                    <span className="text-purple-400">{checks.dbConnection?.success ? 'Yes' : 'No'}</span>
                  </div>
                  {checks.dbConnection?.error && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs">Error: {checks.dbConnection.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Auth Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checks.authSettings?.success)}
                  <h2 className="text-xl font-bold text-white">Auth Configuration</h2>
                </div>
                <div className="ml-8 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(checks.authSettings?.success)}
                    <span className="text-slate-300">Auth API accessible:</span>
                    <span className="text-purple-400">{checks.authSettings?.success ? 'Yes' : 'No'}</span>
                  </div>
                  {checks.authSettings?.error && (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs">Error: {checks.authSettings.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {!checks.envVars?.hasUrl && (
                    <li>• Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file</li>
                  )}
                  {!checks.envVars?.hasAnonKey && (
                    <li>• Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file</li>
                  )}
                  {checks.envVars?.anonKeyLength < 100 && (
                    <li>• Your anon key appears truncated. Copy the full key from Supabase Dashboard → Settings → API</li>
                  )}
                  {!checks.clientInit?.success && (
                    <li>• Supabase client failed to initialize. Check your environment variables.</li>
                  )}
                  {!checks.dbConnection?.success && (
                    <li>• Database connection failed. Verify your Supabase project is active and RLS policies allow access.</li>
                  )}
                  {checks.envVars?.hasUrl && checks.envVars?.hasAnonKey && checks.envVars?.anonKeyLength > 100 && checks.clientInit?.success && (
                    <li className="text-emerald-400">✓ Configuration looks good! Try signing up or logging in.</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={runDiagnostics}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-run Diagnostics
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                >
                  Go to Signup
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
