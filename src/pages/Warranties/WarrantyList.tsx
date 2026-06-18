
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, Search, Clock, AlertTriangle, CheckCircle2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MessageDialog } from '../../components/ui/MessageDialog';

type Warranty = {
  id: string;
  customer_name: string | null;
  expedition_client_name?: string | null;
  order_number: string | null;
  nf_number: string | null;
  start_date: string;
  end_date: string;
  status: string;
};

export const WarrantyList = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativa' | 'expirada'>('all');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteWarrantyId, setDeleteWarrantyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; title?: string; message: string }>({
    open: false,
    title: undefined,
    message: '',
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWarranties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vw_warranties')
          .select('id, customer_name, expedition_client_name, order_number, nf_number, start_date, end_date, status')
          .order('end_date', { ascending: true });

        if (error) {
          console.error('Falha ao carregar garantias:', error);
          console.error('Detalhes:', { message: error.message, code: error.code, details: error.details });
        } else if (data) {
          console.log(`Garantias carregadas da view: ${data.length}`, data);
          if (data.length > 0) {
            console.log('Primeira garantia recebida:', data[0]);
          }
          setWarranties(
            data.map((item: any) => ({
              id: item.id,
              customer_name: item.customer_name || item.expedition_client_name || null,
              expedition_client_name: item.expedition_client_name ?? null,
              order_number: item.order_number,
              nf_number: item.nf_number,
              start_date: item.start_date,
              end_date: item.end_date,
              status: normalizeStatus(item.status),
            }))
          );
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar garantias:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWarranties();
  }, []);
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 224; // matches w-56 ~ 14rem = 224px
    const menuHeight = 120; // estimated height

    let left = rect.left - 180;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    // Prefer opening below; if there's not enough space, open above the button
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > menuHeight + 16 ? rect.bottom + 8 : Math.max(8, rect.top - menuHeight - 8);

    setMenuPosition({ top, left });
    setOpenMenuId(id);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const handleCopyWarrantyId = async (id: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(id);
    }
    handleCloseMenu();
  };

  const handleDeleteWarranty = async (id: string) => {
    if (!id) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.from('warranties').delete().eq('id', id).select('id');
      if (error) {
        console.error('Erro ao excluir garantia:', error);
        setMessageDialog({
          open: true,
          title: 'Erro',
          message: `Falha ao excluir garantia: ${error.message || 'verifique permissões'}`,
        });
        return;
      }

      // If no rows were deleted, warn the user (likely RLS blocked the operation)
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn('Nenhuma garantia deletada — verifique permissões RLS ou se a garantia existe.');
        setMessageDialog({
          open: true,
          title: 'Aviso',
          message: 'Não foi possível excluir a garantia. Você pode não ter permissão para isso.',
        });
        handleCloseMenu();
        const load = async () => {
          setLoading(true);
          const { data: refreshed, error: fetchError } = await supabase
            .from('vw_warranties')
            .select('id, customer_name, expedition_client_name, order_number, nf_number, start_date, end_date, status')
            .order('end_date', { ascending: true });
          if (!fetchError && refreshed) setWarranties(refreshed.map((item: any) => ({
            id: item.id,
            customer_name: item.customer_name || item.expedition_client_name || null,
            expedition_client_name: item.expedition_client_name ?? null,
            order_number: item.order_number,
            nf_number: item.nf_number,
            start_date: item.start_date,
            end_date: item.end_date,
            status: normalizeStatus(item.status),
          })));
          setLoading(false);
        };
        load();
        return;
      }

      setWarranties((prev) => prev.filter((w) => w.id !== id));
      handleCloseMenu();
    } catch (err) {
      console.error('Erro inesperado ao excluir garantia:', err);
      setMessageDialog({
        open: true,
        title: 'Erro',
        message: 'Erro inesperado ao excluir garantia. Veja o console para detalhes.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteWarrantyId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const selectedWarranty = openMenuId ? warranties.find((w) => w.id === openMenuId) : null;
  const normalizeStatus = (status: string | null) => {
    if (!status) return 'ativa';
    if (status === 'active') return 'ativa';
    if (status === 'expired') return 'expirada';
    return status;
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getWarrantyProgress = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalTime = end.getTime() - start.getTime();
    if (totalTime <= 0) {
      return {
        percentage: 100,
        colorClass: 'bg-rose-500',
        label: '100%',
      };
    }

    const elapsedTime = today.getTime() - start.getTime();
    const ratio = Math.min(Math.max(elapsedTime / totalTime, 0), 1);
    const percentage = Math.round(ratio * 100);
    const colorClass = percentage >= 100 ? 'bg-rose-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

    return {
      percentage,
      colorClass,
      label: `${percentage}%`,
    };
  };

  const filteredWarranties = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    const hasSearch = searchValue.length > 0;

    return warranties.filter((w) => {
      const matchesStatus = statusFilter === 'all' ? true : w.status === statusFilter;
      if (!hasSearch) {
        return matchesStatus;
      }

      const searchableFields = [w.id, w.customer_name, w.order_number, w.nf_number]
        .filter(Boolean)
        .map(String)
        .map((value) => value.toLowerCase());

      const matchesSearch = searchableFields.some((value) => value.includes(searchValue));
      return matchesStatus && matchesSearch;
    });
  }, [query, statusFilter, warranties]);

  const totalActive = filteredWarranties.filter((w) => w.status === 'ativa').length;
  const totalExpired = filteredWarranties.filter((w) => w.status === 'expirada').length;
  const totalExpiring = filteredWarranties.filter(
    (w) => w.status === 'ativa' && getDaysRemaining(w.end_date) <= 30
  ).length;
  const averageProgress = filteredWarranties.length
    ? Math.round(
        filteredWarranties.reduce((sum, w) => sum + getWarrantyProgress(w.start_date, w.end_date).percentage, 0) /
          filteredWarranties.length
      )
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Garantias</h2>
          <p className="text-slate-500">Controle e rastreamento de garantias da expedição.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Ativas</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalActive}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">A Vencer (30 dias)</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalExpiring}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Expiradas</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalExpired}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-5 rounded-xl shadow-sm border border-slate-800 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-slate-100">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-300">Progresso médio</p>
              <h3 className="text-2xl font-bold">{averageProgress}%</h3>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${averageProgress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-300">Mostra quanto tempo da garantia já foi consumido.</p>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {loading ? 'Carregando garantias reais...' : `${filteredWarranties.length} garantias carregadas`}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Pesquisar por pedido, NF ou cliente..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('ativa')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'ativa' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
            >
              Ativas
            </button>
            <button
              onClick={() => setStatusFilter('expirada')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusFilter === 'expirada' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
            >
              Expiradas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Pedido</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">NF</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Início Garantia</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Fim Garantia</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Progresso</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarranties.map((w) => (
                <tr
                  key={w.id}
                  onClick={(e) => {
                    // Não navegar se clicou no botão de ações
                    if ((e.target as HTMLElement).closest('button')) return;
                    navigate(`/garantias/${w.id}`);
                  }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-slate-600">{w.order_number || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{w.nf_number || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{w.customer_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(w.start_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(w.end_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 align-middle">
                    {(() => {
                      const progress = getWarrantyProgress(w.start_date, w.end_date);
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-500">
                            <span>{progress.label}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`${progress.colorClass} h-full rounded-full`} style={{ width: `${progress.percentage}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      w.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {w.status === 'ativa' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100"
                      onClick={(event) => handleMenuClick(event, w.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWarranties.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    Nenhuma garantia encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {openMenuId && menuPosition && (
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, zIndex: 50 }}
          >
            <div className="w-56 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-slate-100 text-slate-700"
                onClick={() => handleCopyWarrantyId(openMenuId)}
              >
                Copiar ID da garantia
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-slate-100 text-slate-700"
                onClick={() => setDeleteWarrantyId(openMenuId)}
              >
                Excluir garantia
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(deleteWarrantyId)}
        title="Confirmação"
        description="Deseja realmente excluir esta garantia?"
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
        onCancel={() => setDeleteWarrantyId(null)}
        onConfirm={() => handleDeleteWarranty(deleteWarrantyId || '')}
      />
      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        message={messageDialog.message}
        onClose={() => setMessageDialog({ open: false, title: undefined, message: '' })}
      />
    </div>
  );
};
