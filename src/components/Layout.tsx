
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Search, User, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  Dumbbell, 
  Star, 
  ShieldCheck, 
  UserCircle, 
  BarChart3, 
  Settings
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Expedições', path: '/expedicoes' },
  { icon: Truck, label: 'Entregas', path: '/entregas' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Star, label: 'Feedbacks', path: '/feedbacks' },
  { icon: ShieldCheck, label: 'Garantias', path: '/garantias' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: UserCircle, label: 'Usuários', path: '/usuarios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Usuário');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          // Fetch user data from users table
          const { data, error, status } = await supabase
            .from('users')
            .select('name, role')
            .eq('email', session.user.email)
            .maybeSingle();

          if (error && status !== 406) {
            console.error('Erro ao buscar dados do usuário:', error.message);
            setUserName(session.user.email.split('@')[0]);
          } else if (data) {
            setUserName(data.name || 'Usuário');
            setUserRole(data.role || '');
          } else {
            setUserName(session.user.email.split('@')[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-blue-600 w-6 h-6" />
                <span className="font-bold text-xl">FitLog</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full w-64 lg:w-96">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por NF, Cliente, SKU..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 lg:mx-2" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                <p className="text-[11px] text-slate-500 font-medium">{userRole}</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-300">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
