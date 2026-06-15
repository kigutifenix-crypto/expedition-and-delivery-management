
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Settings,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { MessageDialog } from './ui/MessageDialog';

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

export const Sidebar = () => {
  const navigate = useNavigate();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogText, setMessageDialogText] = useState('');

  const showErrorMessage = (message: string) => {
    setMessageDialogText(message);
    setMessageDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao deslogar:', error);
        showErrorMessage('Falha ao sair do sistema. Veja o console para mais detalhes.');
        return;
      }
      navigate('/login');
    } catch (err) {
      console.error('Erro inesperado ao deslogar:', err);
      showErrorMessage('Erro inesperado ao sair do sistema.');
    }
  };
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 hidden lg:flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Dumbbell className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-slate-800">FitLog</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-tight">Logística Fitness</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-blue-50 text-blue-700 font-semibold" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className={clsx(
              "w-5 h-5",
              "group-hover:scale-110 transition-transform"
            )} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair do Sistema</span>
        </button>
      </div>
      <MessageDialog
        open={messageDialogOpen}
        title="Atenção"
        message={messageDialogText}
        onClose={() => setMessageDialogOpen(false)}
      />
    </aside>
  );
};
