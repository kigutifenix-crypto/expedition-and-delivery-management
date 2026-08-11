import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { MessageDialog } from './ui/MessageDialog';
import { navGroups } from './nav-items';

export const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-all duration-200',
    isActive
      ? 'bg-brand-700 font-semibold text-white shadow-[0_10px_22px_-14px_rgba(31,58,138,.95)]'
      : 'font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700',
  );

export const Brand: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-700 text-white shadow-[0_10px_22px_-14px_rgba(31,58,138,.95)]">
      <Dumbbell className="h-5 w-5" />
    </div>
    {!compact && (
      <div className="leading-tight">
        <p className="text-[17px] font-bold tracking-tight text-ink">FitLog</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">Logística Fitness</p>
      </div>
    )}
  </div>
);

export const SidebarNav: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
    {navGroups.map((group) => (
      <div key={group.title}>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">{group.title}</p>
        <div className="space-y-1">
          {group.items.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onNavigate} className={navLinkClass}>
              <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    ))}
  </nav>
);

export const useLogout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const logout = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError('Falha ao sair do sistema. Tente novamente em alguns instantes.');
        return;
      }
      navigate('/login');
    } catch {
      setError('Erro inesperado ao sair do sistema.');
    }
  };
  return { logout, error, clearError: () => setError('') };
};

export const LogoutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger"
  >
    <LogOut className="h-[18px] w-[18px]" />
    Sair do sistema
  </button>
);

export const Sidebar = () => {
  const { logout, error, clearError } = useLogout();

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="px-5 py-5">
        <Brand />
      </div>
      <SidebarNav />
      <div className="border-t border-line p-4">
        <div className="mb-3 rounded-[12px] bg-brand-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">Plano operacional</p>
          <p className="mt-1 text-[12px] leading-snug text-ink-soft">
            Rastreamento de expedições, entregas e garantias em um só lugar.
          </p>
        </div>
        <LogoutButton onClick={logout} />
      </div>
      <MessageDialog open={Boolean(error)} title="Atenção" message={error} onClose={clearError} />
    </aside>
  );
};
