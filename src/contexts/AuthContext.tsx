import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: number;
  nome: string | null;
  email: string | null;
  cpf: string | null;
  cpfCnpj: string | null;
  whatsapp: string | null;
  ddd: string | null;
  cep: string | null;
  bairro: string | null;
  numero: number | null;
  complemento: string | null;
  self: string | null;
  documento: string | null;
  favela: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isProfileComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        loadProfile(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        loadProfile(session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (email: string) => {
    try {
      console.log('🔍 Carregando perfil para email:', email);

      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro de "não encontrado"
        console.error('Error loading profile:', error);
      }

      console.log('✅ Perfil carregado:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      await supabase.from('User').insert({
        email: data.user.email,
        created_at: new Date().toISOString(),
      });
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.email) return;

    const { error } = await supabase
      .from('User')
      .upsert({
        email: user.email,
        ...data,
      });

    if (!error && user.email) {
      loadProfile(user.email);
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      (profile.cpf || profile.cpfCnpj) &&
      profile.whatsapp &&
      profile.cep &&
      profile.nome
    );
  };

  const value = {
    user,
    session,
    profile,
    userProfile: profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    isProfileComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};