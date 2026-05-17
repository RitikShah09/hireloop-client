'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { loginSchema, LoginFormData } from '@/validators';
import { authApi } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { Modal, Input, Button, Divider } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export function LoginModal({ open, onClose, onSuccess, message }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ data }) => {
      const u = data?.data?.user;
      if (u) {
        dispatch(
          setUser({
            userId: u.id,
            role: u.role as 'COMPANY' | 'CANDIDATE' | 'ADMIN',
            email: u.email,
            firstName: u.candidate?.firstName,
            lastName: u.candidate?.lastName,
            avatarUrl: u.candidate?.avatarUrl,
            companyName: u.company?.name,
            logoUrl: u.company?.logoUrl,
          })
        );
        toast.success('Logged in!');
        reset();
        onClose();
        onSuccess?.();
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <Modal open={open} onClose={onClose} title="Sign in to continue" size="sm">
      <div className="space-y-4">
        {message && (
          <p className="text-muted-foreground bg-primary-light border-primary/20 rounded border px-4 py-3 text-sm">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={14} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock size={14} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            className="w-full"
            isLoading={isPending}
            leftIcon={<LogIn size={14} />}
          >
            Sign In
          </Button>
        </form>

        <Divider label="or" />

        <p className="text-muted-foreground text-center text-sm">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
            onClick={onClose}
          >
            Create one
          </Link>
        </p>
        <p className="text-muted-foreground text-center text-xs">
          <Link href="/forgot-password" className="hover:underline" onClick={onClose}>
            Forgot password?
          </Link>
        </p>
      </div>
    </Modal>
  );
}
