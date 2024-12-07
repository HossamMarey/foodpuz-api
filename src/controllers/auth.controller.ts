import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: data.user?.confirmed_at 
        ? req.t('auth.registration.success')
        : req.t('auth.registration.successWithVerification'),
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.confirmed_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: req.t('auth.registration.error') });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: req.t('auth.login.success'),
      session: {
        token: data.session?.access_token,
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: req.t('auth.login.error') });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token } = req.body;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: access_token,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: req.t('auth.google.success'),
      session: {
        token: data.session?.access_token,
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: req.t('auth.google.error') });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: req.t('auth.logout.success') });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: req.t('auth.logout.error') });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: req.t('auth.token.success'),
      session: {
        token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: req.t('auth.token.refreshError') });
  }
};

export const checkEmailVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ error: req.t('auth.notAuthenticated') });
      return;
    }

    res.status(200).json({
      emailConfirmed: !!user.confirmed_at,
      email: user.email
    });
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({ error: req.t('auth.email.verificationCheckError') });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: req.t('auth.email.verificationSent')
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: req.t('auth.email.verificationError') });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token } = req.query;

    if (!access_token || typeof access_token !== 'string') {
      res.status(400).json({ error: req.t('auth.email.invalidToken') });
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: access_token,
      type: 'email',
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({
      message: req.t('auth.email.verificationSuccess')
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: req.t('auth.email.verificationFailed') });
  }
};
