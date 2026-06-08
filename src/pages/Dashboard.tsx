
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, ShieldCheck, Star, Package, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';

type DashboardStat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  bg: string;
};

type DeliveryRow = {
  id: string;
  status: string;
  created_at?: string;
  order_number?: string;
  nf_number?: string;
  customer_name?: string;
};

type ExpeditionRow = {
  id: string;
  client_name?: string;
  order_number?: string;
  nf_number?: string;
  status?: string;
  date?: string;
};

const statusColors = {
  pendente: '#f59e0b',
  em_transito: '#2563eb',
  entregue: '#22c55e',
  finalizado: '#14b8a6',
  concluido: '#0ea5e9',
  cancelado: '#ef4444',
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [deliveryData, setDeliveryData] = useState<{ name: string; total: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [recentExpeditions, setRecentExpeditions] = useState<ExpeditionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('carregando...');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [deliveriesResult, expeditionsResult, feedbacksResult, warrantiesResult] = await Promise.all([
          supabase.from<DeliveryRow>('deliveries').select('id,status,created_at,order_number,nf_number'),
          supabase.from<ExpeditionRow>('expeditions').select('id,client_name,order_number,nf_number,status,date').order('date', { ascending: false }).limit(4),
          supabase.from<{ rating: number }>('feedbacks').select('rating'),
          supabase.from('vw_warranties').select('id,status'),
        ]);

        const deliveries = deliveriesResult.data ?? [];
        const expeditions = expeditionsResult.data ?? [];
        const feedbacks = feedbacksResult.data ?? [];
        const warranties = warrantiesResult.data ?? [];

        if (warrantiesResult.error) {
          console.error('Erro ao carregar garantias no dashboard:', warrantiesResult.error);
        }

        const pendingDeliveries = deliveries.filter((item) => item.status === 'pendente' || item.status === 'em_transito').length;
        const completedDeliveries = deliveries.filter((item) => item.status === 'entregue' || item.status === 'finalizado' || item.status === 'concluido').length;
        const activeWarranties = warranties.filter((item: any) => item.status === 'active').length;
        console.log(`Garantias encontradas: ${warranties.length}, Ativas: ${activeWarranties}`, warranties);
      const averageRating = feedbacks.length ? (feedbacks.reduce((sum, item) => sum + (item.rating ?? 0), 0) / feedbacks.length).toFixed(1) : '0.0';

      const monthlyMap = new Map<string, number>();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        return monthNames[date.getMonth()];
      });
      lastSixMonths.forEach((month) => monthlyMap.set(month, 0));

      deliveries.forEach((item) => {
        const date = item.created_at ? new Date(item.created_at) : null;
        if (!date || Number.isNaN(date.getTime())) return;
        const month = monthNames[date.getMonth()];
        if (monthlyMap.has(month)) {
          monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
        }
      });

      const statusCounts = deliveries.reduce<Record<string, number>>((acc, item) => {
        const key = item.status || 'outros';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});

      setStats([
        { label: 'Expedições em andamento', value: String(expeditions.filter((item) => item.status === 'pendente' || item.status === 'em_transito').length), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Entregas concluídas', value: String(completedDeliveries), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Entregas pendentes', value: String(pendingDeliveries), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Garantias ativas', value: String(activeWarranties), icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Feedback médio', value: `${averageRating}/5`, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { label: 'Feedbacks registrados', value: String(feedbacks.length), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      ]);

      setDeliveryData(lastSixMonths.map((name) => ({ name, total: monthlyMap.get(name) ?? 0 })));
      setStatusData(
        Object.entries(statusCounts).map(([key, value]) => ({
          name: key.replace('_', ' ').replace(/^(.)/, (match) => match.toUpperCase()),
          value,
          color: statusColors[key as keyof typeof statusColors] ?? '#94a3b8',
        }))
      );
      setRecentExpeditions(expeditions);
      setLastUpdate(new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }));
      setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statusTotal = useMemo(() => statusData.reduce((sum, item) => sum + item.value, 0), [statusData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard de Logística</h2>
          <p className="text-slate-500">Visão geral da expedição e entregas com dados reais do sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Última atualização: {lastUpdate}</span>
          <button
            onClick={() => navigate('/relatorios')}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Gerar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 leading-tight">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Entregas por mês</h3>
              <p className="text-sm text-slate-500">Últimos 6 meses do histórico do sistema.</p>
            </div>
          </div>
          <div className="h-[300px] w-full" style={{ minHeight: '300px', minWidth: '0' }}>
            {deliveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Carregando dados...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Distribuição por status</h3>
          <div className="h-[300px] relative w-full" style={{ minHeight: '300px', minWidth: '0' }}>
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">{statusTotal}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total de entregas</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Carregando dados...</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">Últimas expedições</h3>
              <p className="text-sm text-slate-500">Registro das últimas expedições criadas no sistema.</p>
            </div>
            {loading ? (
              <span className="text-xs text-slate-400">Atualizando...</span>
            ) : (
              <span className="text-xs text-slate-400">Dados reais carregados</span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            {recentExpeditions.length > 0 ? (
              recentExpeditions.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.client_name ?? 'Cliente desconhecido'}</p>
                    <p className="text-xs text-slate-500">NF: {item.nf_number ?? '—'} • Pedido: {item.order_number ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.status === 'em_transito' || item.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status?.replace('_', ' ') ?? 'Sem status'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-slate-500">Nenhuma expedição recente encontrada.</div>
            )}
          </div>
          <button onClick={() => navigate('/expedicoes')} className="w-full mt-6 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Ver todas expedições
          </button>
        </div>
      </div>
    </div>
  );
};
