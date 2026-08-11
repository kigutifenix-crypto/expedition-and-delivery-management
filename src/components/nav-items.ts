import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Star,
  ShieldCheck,
  UserCircle,
  BarChart3,
  Settings,
} from 'lucide-react';

export type NavItem = { icon: any; label: string; path: string };

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Operação',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Package, label: 'Expedições', path: '/expedicoes' },
      { icon: Truck, label: 'Entregas', path: '/entregas' },
    ],
  },
  {
    title: 'Pós-venda',
    items: [
      { icon: Users, label: 'Clientes', path: '/clientes' },
      { icon: Star, label: 'Feedbacks', path: '/feedbacks' },
      { icon: ShieldCheck, label: 'Garantias', path: '/garantias' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
      { icon: UserCircle, label: 'Usuários', path: '/usuarios' },
      { icon: Settings, label: 'Configurações', path: '/configuracoes' },
    ],
  },
];
