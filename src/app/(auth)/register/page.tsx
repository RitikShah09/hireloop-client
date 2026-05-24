'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { registerSchema, RegisterFormData } from '@/validators';
import { authApi } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import api from '@/lib/axios';
import { useGuestGuard } from '@/hooks/useAuthGuard';
import { Input, Button, Divider } from '@/components/ui';
import { cn } from '@/lib/utils';
import { User, Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  useGuestGuard();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [role, setRole] = useState<'COMPANY' | 'CANDIDATE'>('CANDIDATE');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CANDIDATE' },
  });

  const { mutate: registerUser, isPending } = useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register({ ...data, role }),
    onSuccess: ({ data }) => {
      if (data.data?.user) {
        const u = data.data.user as {
          id: string;
          email: string;
          role: string;
          candidate?: { firstName?: string; lastName?: string };
          company?: { name?: string };
        };
        dispatch(
          setUser({
            userId: u.id,
            role: u.role as 'COMPANY' | 'CANDIDATE' | 'ADMIN',
            email: u.email,
            firstName: u.candidate?.firstName,
            lastName: u.candidate?.lastName,
            companyName: u.company?.name,
            emailVerified: false,
          })
        );

        api.post('/auth/send-otp').catch(() => {});
        toast.success('Welcome to HireLoop!');
        router.push('/verify-email');
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Registration failed');
    },
  });

  const handleRoleChange = (r: 'COMPANY' | 'CANDIDATE') => {
    setRole(r);
    setValue('role', r);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center py-12">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-primary mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg">
            <span className="text-base font-bold text-white">H</span>
          </div>
          <h1 className="text-foreground text-2xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Join HireLoop today</p>
        </div>

        <div className="sm:border-border bg-surface p-5 sm:rounded-lg sm:border">
          <div className="border-border mb-5 flex overflow-hidden rounded-lg border">
            {(
              [
                { value: 'CANDIDATE', label: 'Job Seeker', icon: User },
                { value: 'COMPANY', label: 'Employer', icon: Building2 },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                className={cn(
                  'transition-micro flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium',
                  role === value
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-surface-raised'
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit((d) => registerUser(d))} className="space-y-3.5">
            {role === 'CANDIDATE' ? (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
            ) : (
              <Input
                label="Company Name"
                placeholder="Acme Inc."
                leftIcon={<Building2 size={15} />}
                error={errors.companyName?.message}
                {...register('companyName')}
              />
            )}

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
              placeholder="Min 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={errors.password?.message}
              hint="Min. 8 characters with uppercase, number, and symbol"
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              leftIcon={<Lock size={15} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={isPending} className="mt-1 w-full" size="lg">
              Create Account
            </Button>
          </form>

          <Divider className="my-5" />

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
