import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface WarrantyDetailData {
  id: string;
  customer_name: string | null;
  expedition_client_name: string | null;
  order_number: string | null;
  nf_number: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}

export const WarrantyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warranty, setWarranty] = useState<WarrantyDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadWarranty = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vw_warranties')
        .select('id, customer_name, expedition_client_name, order_number, nf_number, start_date, end_date, status')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar garantia:', error);
        setWarranty(null);
      } else if (data) {
        setWarranty(data as WarrantyDetailData);
      } else {
        setWarranty(null);
      }
      setLoading(false);
    };

    loadWarranty();
  }, [id]);

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detalhe da Garantia</h2>
          <p className="text-slate-500">Veja as informações completas dessa garantia.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/garantias')}
          className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-200"
        >
          Voltar para garantias
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500">Carregando garantia...</div>
      ) : !warranty ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-rose-600">Garantia não encontrada.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm text-slate-500 uppercase tracking-[0.2em]">Cliente</h3>
              <p className="mt-3 text-xl font-bold text-slate-800">{warranty.customer_name || warranty.expedition_client_name || '—'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm text-slate-500 uppercase tracking-[0.2em]">Pedido / NF</h3>
              <p className="mt-3 text-xl font-bold text-slate-800">{warranty.order_number || '—'} / {warranty.nf_number || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm text-slate-500 uppercase tracking-[0.2em]">Início</h3>
              <p className="mt-3 text-lg font-semibold text-slate-800">{formatDate(warranty.start_date)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm text-slate-500 uppercase tracking-[0.2em]">Fim</h3>
              <p className="mt-3 text-lg font-semibold text-slate-800">{formatDate(warranty.end_date)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm text-slate-500 uppercase tracking-[0.2em]">Status</h3>
              <p className="mt-3 text-lg font-semibold text-slate-800">{warranty.status || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
