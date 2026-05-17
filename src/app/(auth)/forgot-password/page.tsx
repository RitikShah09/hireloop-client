'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { KeyRound, CheckCircle, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Button } from '@/components/ui';

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);

  const { mutate: sendOtp, isPending: sending } = useMutation({
    mutationFn: () => api.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      setStep('otp');
      toast.success('OTP sent to your email');
    },
    onError: () => toast.error('Failed to send OTP'),
  });

  const { mutate: resetPass, isPending: resetting } = useMutation({
    mutationFn: () => api.post('/auth/reset-password', { email, otp, newPassword }),
    onSuccess: () => setStep('done'),
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err?.response?.data?.message || 'Invalid OTP or request'),
  });

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    resetPass();
  };

  const stepTitle: Record<Step, string> = {
    email: 'Forgot Password',
    otp: 'Enter OTP',
    password: 'New Password',
    done: 'Password Reset!',
  };

  const stepDesc: Record<Step, string> = {
    email: "Enter your email and we'll send you a reset code",
    otp: `Enter the 6-digit code sent to ${email}`,
    password: 'Choose a strong new password',
    done: 'Your password has been reset successfully',
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="sm:border-border bg-surface p-5 sm:rounded-lg sm:border">
          <div className="mb-7 text-center">
            <div
              className={`mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-md py-1.5 ${step === 'done' ? 'bg-success-light' : 'bg-primary-light'}`}
            >
              {step === 'done' ? (
                <CheckCircle size={26} className="text-success" />
              ) : (
                <KeyRound size={26} className="text-primary" />
              )}
            </div>
            <h1 className="text-foreground text-xl font-semibold">{stepTitle[step]}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{stepDesc[step]}</p>
          </div>

          {step === 'email' && (
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && sendOtp()}
                placeholder="you@example.com"
                leftIcon={<Mail size={14} />}
              />
              <Button
                className="w-full"
                size="lg"
                isLoading={sending}
                disabled={!email}
                onClick={() => sendOtp()}
              >
                Send Reset Code
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <Input
                label="OTP Code"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg font-bold tracking-widest"
              />
              <Button
                className="w-full"
                size="lg"
                disabled={otp.length < 6}
                onClick={() => setStep('password')}
              >
                Continue
              </Button>
              <button
                onClick={() => sendOtp()}
                disabled={sending}
                className="text-primary w-full text-sm hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <Input
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                leftIcon={<Lock size={14} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                placeholder="Re-enter password"
                leftIcon={<Lock size={14} />}
              />
              <Button
                className="w-full"
                size="lg"
                isLoading={resetting}
                disabled={!newPassword || !confirmPassword}
                onClick={handleReset}
              >
                Reset Password
              </Button>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground text-sm">
                You can now log in with your new password.
              </p>
              <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground transition-micro inline-flex items-center gap-1 text-sm"
              >
                <ArrowLeft size={13} />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
