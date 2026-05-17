'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/axios';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { mutate: sendOtp, isPending: sending } = useMutation({
    mutationFn: () => api.post('/auth/send-otp'),
    onSuccess: () => toast.success('OTP sent to your email!'),
    onError: () => toast.error('Failed to send OTP'),
  });

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: (code: string) => api.post('/auth/verify-email', { otp: code }),
    onSuccess: () => {
      toast.success('Email verified! Welcome to HireLoop.');
      router.push('/dashboard');
    },
    onError: () => toast.error('Invalid or expired OTP'),
  });

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5) {
      const code = [...updated.slice(0, 5), value].join('');
      if (code.length === 6) verify(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      verify(pasted);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="sm:border-border bg-surface p-5 text-center sm:rounded-lg sm:border">
          <div className="bg-primary-light mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg">
            <Mail size={28} className="text-primary" />
          </div>

          <h1 className="text-foreground mb-2 text-xl font-semibold">Verify your email</h1>
          <p className="text-muted-foreground mb-1 text-sm">We sent a 6-digit code to</p>
          <p className="text-primary mb-6 font-medium">{user?.email || 'your email'}</p>

          <div className="mb-6 flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="focus:ring-primary transition-micro bg-surface text-foreground h-11 w-11 rounded-lg border-2 text-center text-xl font-bold focus:ring-2 focus:outline-none"
                style={{
                  borderColor: digit ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
              />
            ))}
          </div>

          <Button
            className="w-full"
            size="lg"
            leftIcon={<CheckCircle size={16} />}
            isLoading={verifying}
            disabled={otp.join('').length < 6}
            onClick={() => verify(otp.join(''))}
          >
            Verify Email
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <p className="text-muted-foreground text-sm">Didn't receive it?</p>
            <button
              onClick={() => sendOtp()}
              disabled={sending}
              className="text-primary flex items-center gap-1 text-sm hover:underline disabled:opacity-50"
            >
              <RefreshCw size={12} className={sending ? 'animate-spin' : ''} />
              Resend OTP
            </button>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-micro mt-4 text-xs"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
