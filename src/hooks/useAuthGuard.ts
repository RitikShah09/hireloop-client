'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, clearAuth, setLoading } from '@/store/slices/authSlice';
import { authApi } from '@/services/api';

export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(setLoading(true));
    authApi
      .me()
      .then(({ data }) => {
        if (data.data) {
          const u = data.data;
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
        } else {
          dispatch(clearAuth());
        }
      })
      .catch(() => dispatch(clearAuth()));
  }, [dispatch]);

  return { isLoading };
};

const PUBLIC_PATTERNS = [/^\/jobs\/[^/]+$/];

export const useAuthGuard = (requiredRole?: 'COMPANY' | 'CANDIDATE') => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);

  const isPublic = PUBLIC_PATTERNS.some((p) => p.test(pathname));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, isPublic]);

  return { isAuthenticated, isLoading, user, isPublic };
};

export const useGuestGuard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
};
