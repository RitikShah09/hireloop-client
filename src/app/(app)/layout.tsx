'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';
import { authApi } from '@/services/api';
import { useAuthGuard, useAuthInit } from '@/hooks/useAuthGuard';
import { useUnreadNotificationCount } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Building2,
  MessageSquare,
  Brain,
  Search,
  Calendar,
  BarChart2,
  Bell,
  Menu,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const candidateNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { href: '/ai-search', label: 'AI Job Search', icon: Brain },
  { href: '/search/companies', label: 'Companies', icon: Building2 },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/interviews', label: 'Interviews', icon: Calendar },
  { href: '/resumes', label: 'Resumes', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const companyNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/candidates', label: 'Candidates', icon: User },
  { href: '/search/candidates', label: 'Search', icon: Search },
  { href: '/interviews', label: 'Interviews', icon: Calendar },
  { href: '/ai-chat', label: 'AI Recruiter', icon: MessageSquare },
  { href: '/profile', label: 'Company Profile', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: NavItem & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('nav-item group', active && 'nav-item-active')}
    >
      <Icon
        size={16}
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && <span className="badge-danger badge px-1.5 py-0 text-[10px]">{badge}</span>}
      {active && <ChevronRight size={12} className="text-primary shrink-0 opacity-60" />}
    </Link>
  );
}

function Sidebar({
  nav,
  user,
  onClose,
}: {
  nav: NavItem[];
  user: ReturnType<typeof useAuthGuard>['user'];
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { mutate: logoutUser } = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      dispatch(clearAuth());
      toast.success('Signed out');
      router.push('/login');
    },
  });

  const displayName =
    user?.role === 'COMPANY'
      ? user.companyName || user.email?.split('@')[0]
      : user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email?.split('@')[0];

  return (
    <div className="bg-surface border-border flex h-full w-60 flex-col border-r">
      <div className="border-border flex h-[48.67px] items-center justify-between border-b px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-lg">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <span className="text-foreground text-sm font-semibold">HireLoop</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="btn-ghost btn-sm rounded p-1 lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="border-border border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-muted relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {user?.avatarUrl || user?.logoUrl ? (
              <Image
                src={(user.avatarUrl || user.logoUrl)!}
                alt={displayName || ''}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-primary text-xs font-semibold">
                {displayName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-xs font-medium">{displayName}</p>
            <p className="text-muted-foreground text-[10px] capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            }
            onClick={onClose}
          />
        ))}
      </nav>

      <div className="border-border space-y-0.5 border-t px-3 py-3">
        <button
          onClick={() => logoutUser()}
          className="nav-item text-danger hover:text-danger hover:bg-danger/8 w-full"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function NotificationBell() {
  const qc = useQueryClient();
  const { data, refetch } = useUnreadNotificationCount();
  const count = data?.data?.count ?? 0;

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const es = new EventSource(`${apiUrl}/notifications/stream`, {
      withCredentials: true,
    });

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'notification') {
          refetch();

          qc.invalidateQueries({ queryKey: ['notifications'] });
        }
      } catch {}
    };

    return () => es.close();
  }, [refetch, qc]);

  return (
    <Link
      href="/notifications"
      className="btn-ghost btn-sm relative rounded-xl p-2"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {count > 0 && <span className="notif-dot">{count > 9 ? '9+' : count}</span>}
    </Link>
  );
}

const PUBLIC_PATTERNS = [/^\/jobs\/[^/]+$/];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useAuthInit();
  const { user, isLoading } = useAuthGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = user?.role === 'COMPANY' ? companyNav : candidateNav;

  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const isPublicRoute = PUBLIC_PATTERNS.some((p) => p.test(pathname));

  if (!user && !isLoading && isPublicRoute) {
    return (
      <div className="bg-background min-h-screen">
        <header className="border-border bg-surface flex items-center justify-between border-b px-5 py-3 sm:px-10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary flex h-7 w-7 items-center justify-center rounded">
              <span className="text-xs font-bold text-white">H</span>
            </div>
            <span className="text-foreground text-sm font-semibold">HireLoop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="btn btn-md btn-secondary">Sign In</button>
            </Link>
            <Link href="/register">
              <button className="btn btn-md btn-primary">Get Started</button>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-10">{children}</main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <div className="hidden shrink-0 flex-col lg:flex">
        <Sidebar nav={nav} user={user} />
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden',
          'transition-opacity duration-300 ease-in-out',
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar nav={nav} user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-border bg-surface flex shrink-0 items-center justify-between border-b px-5 py-2.5 sm:px-10 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost btn-sm rounded-lg p-0"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <NotificationBell />
        </header>

        <header className="border-border bg-surface hidden shrink-0 items-center justify-end border-b px-10 py-2.5 lg:flex">
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-5 sm:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
