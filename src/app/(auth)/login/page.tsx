'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { loginSchema, LoginFormData } from '@/validators';
import { authApi } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useGuestGuard } from '@/hooks/useAuthGuard';
import { Input, Button, Divider } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  useGuestGuard();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ data }) => {
      if (data.data?.user) {
        const u = data.data.user as {
          id: string;
          email: string;
          role: string;
          emailVerified?: boolean;
          candidate?: { firstName?: string; lastName?: string; avatarUrl?: string };
          company?: { name?: string; logoUrl?: string };
        };
        dispatch(
          setUser({
            userId: u.id,
            role: u.role as 'COMPANY' | 'CANDIDATE' | 'ADMIN',
            email: u.email,
            emailVerified: u.emailVerified,
            firstName: u.candidate?.firstName,
            lastName: u.candidate?.lastName,
            avatarUrl: u.candidate?.avatarUrl,
            companyName: u.company?.name,
            logoUrl: u.company?.logoUrl,
          })
        );
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center py-12">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <span className="text-base font-bold text-white">H</span>
          </div>
          <h1 className="text-foreground text-2xl font-semibold">Sign in to HireLoop</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Enter your credentials to continue</p>
        </div>

        <div className="sm:border-border bg-surface p-5 sm:rounded-lg sm:border">
          <form onSubmit={handleSubmit((d) => login(d))} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-primary text-xs transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isPending} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <Divider className="my-5" />

          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
