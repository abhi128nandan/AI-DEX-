"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';

interface Profile {
  username: string | null;
  avatar_url?: string | null;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();
          setProfile(profileData || null);
        } catch (error) {
          console.warn('Profile fetch error caught silently');
          setProfile(null);
        }
      }
      
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', session.user.id)
              .maybeSingle();
            setProfile(profileData || null);
          } catch (error) {
            console.warn('Profile fetch error caught silently');
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        return;
      }
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  const getInitial = () => {
    const name = profile?.username || user?.email;
    return name ? name.charAt(0).toUpperCase() : null;
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />;
  }

  if (user) {
    const fallbackInitial = getInitial();
    
    return (
      <div className="relative group/user z-50 flex items-center gap-3">
        {/* Trigger / Avatar */}
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 border border-white/10 text-white font-bold text-sm shadow-inner overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            fallbackInitial || <UserIcon className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Dropdown Menu */}
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#12121c] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 overflow-hidden transform origin-top-right scale-95 group-hover/user:scale-100">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.username || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
          <div className="p-1">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <Link 
        href="/login"
        className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-white/5"
      >
        Sign In
      </Link>
  );
}
