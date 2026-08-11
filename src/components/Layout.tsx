import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Sidebar, Brand, SidebarNav, LogoutButton, useLogout } from './Sidebar';
import { MessageDialog } from './ui/MessageDialog';

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [userRole, setUserRole] = useState('');
  const { logout, error, clearError } = useLogout();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const { data, error: queryError, status } = await supabase
            .from('users')
            .select('name, role')
            .eq('email', session.user.email)
            .maybeSingle();

          if (queryError && status !== 406) {
            setUserName(session.user.email.split('@')[0]);
          } else if (data) {
            setUserName(data.name || 'Usuário');
            setUserRole(data.role || '');
          } else {
            setUserName(session.user.email.split('@')[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      {/* Drawer mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="animate-rise relative flex h-full w-[86%] max-w-[300px] flex-col border-r border-line bg-surface">
            <div className="flex items-center justify-between px-5 py-5">
              <Brand />
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 text-ink-faint hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setIsMobileMenuOpen(false)} />
            <div className="border-t border-line p-4">
              <LogoutButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/85 px-4 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="rounded-[10px] p-2 text-ink-soft hover:bg-surface-muted lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <label className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-[10px] border border-line bg-surface-muted px-3 py-2 transition-colors focus-within:border-brand-400 focus-within:bg-surface md:flex">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" />
              <input
                type="text"
                placeholder="Buscar por NF, cliente ou SKU..."
                className="w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="hidden shrink-0 rounded border border-line-strong bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint lg:block">
                /
              </kbd>
            </label>
          </div>

          <div className="flex items-center gap-1 lg:gap-3">
            <button
              type="button"
              aria-label="Notificações"
              className="relative rounded-full p-2 text-ink-soft transition-colors hover:bg-surface-muted"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
            </button>
            <div className="mx-1 hidden h-8 w-px bg-line sm:block" />
            <button
              type="button"
              onClick={logout}
              title="Sair do sistema"
              className="flex items-center gap-2 rounded-[10px] py-1.5 pl-1.5 pr-2 transition-colors hover:bg-surface-muted"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-[12px] font-bold text-white">
                {initials(userName)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13px] font-semibold text-ink">{userName}</span>
                <span className="block text-[11px] capitalize text-ink-faint">{userRole || 'operação'}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-ink-faint sm:block" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">{children}</div>
        </main>

        <footer className="border-t border-line px-4 py-4 lg:px-8">
          <p className="text-[12px] text-ink-faint">
            FitLog · Sistema de gestão de expedição, entregas e garantias
          </p>
        </footer>
      </div>

      <MessageDialog open={Boolean(error)} title="Atenção" message={error} onClose={clearError} />
    </div>
  );
};
