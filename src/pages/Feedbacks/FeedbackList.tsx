import React, { useEffect, useMemo, useState } from 'react';
import { Star, Search, MessageSquare, ThumbsUp, Quote, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PromptDialog } from '../../components/ui/PromptDialog';

type Feedback = {
  id: string;
  delivery_id: string;
  expedition_id?: string;
  customer_id: string | null;
  client_name?: string | null;
  expedition_order_number?: string | null;
  delivery_order_number?: string | null;
  delivery_rating?: number | null;
  installation_rating?: number | null;
  service_rating?: number | null;
  equipment_rating?: number | null;
  rating: number | null;
  comment: string | null;
  response?: string;
  liked?: boolean;
  created_at: string;
};

export const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyFeedbackId, setReplyFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedbacks = async () => {
      setLoading(true);
      // Buscar feedbacks já com relações para evitar múltiplas chamadas por item
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*, customers(name), deliveries(order_number), expeditions(order_number, client_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Falha ao carregar feedbacks reais:', error.message);
      } else if (data) {
        // Mapear campos relacionados para uso na UI
        const mapped = (data as any[]).map((f) => ({
          id: f.id,
          delivery_id: f.delivery_id,
          expedition_id: f.expedition_id,
          customer_id: f.customer_id,
          // Priorizar o nome registrado na expedição quando existir
          client_name: f.expeditions?.client_name ?? f.client_name ?? f.customers?.name ?? null,
          expedition_order_number: f.expeditions?.order_number ?? null,
          delivery_order_number: f.deliveries?.order_number ?? null,
          rating: f.rating ?? null,
          delivery_rating: f.delivery_rating ?? null,
          installation_rating: f.installation_rating ?? null,
          service_rating: f.service_rating ?? null,
          equipment_rating: f.equipment_rating ?? null,
          comment: f.comment ?? null,
          response: f.response ?? undefined,
          liked: f.liked ?? false,
          created_at: f.created_at,
        })) as Feedback[];

        setFeedbacks(mapped);
      }
      setLoading(false);
    };

    loadFeedbacks();
  }, []);

  const filteredFeedbacks = useMemo(
    () =>
      feedbacks.filter((item) =>
        [item.client_name ?? item.customer_id ?? '', item.comment ?? '', item.delivery_id, item.expedition_order_number ?? '', item.delivery_order_number ?? '']
          .some((value) => value.toLowerCase().includes(query.toLowerCase()))
      ),
    [feedbacks, query]
  );

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return '0.0';
    const total = feedbacks.reduce((sum, item) => sum + (item.rating ?? 0), 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const handleThanks = (id: string) => {
    setFeedbacks((current) =>
      current.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item))
    );
  };

  const handleReply = (id: string) => {
    setReplyFeedbackId(id);
  };

  const handleSubmitReply = (response: string) => {
    if (!replyFeedbackId || !response.trim()) {
      setReplyFeedbackId(null);
      return;
    }

    setFeedbacks((current) =>
      current.map((item) => (item.id === replyFeedbackId ? { ...item, response } : item))
    );
    setReplyFeedbackId(null);
  };

  // fechar modal com ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFeedback(null);
    };
    if (selectedFeedback) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedFeedback]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Feedbacks dos Clientes</h2>
          <p className="text-slate-500">Acompanhe o índice de satisfação das entregas.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
            placeholder="Buscar feedback ou cliente..."
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500 text-sm">
          Carregando feedbacks reais...
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Média Geral</p>
          <h3 className="text-4xl font-bold text-slate-800">{averageRating}</h3>
          <div className="flex justify-center gap-1 mt-2 text-yellow-400">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} size={16} fill={index < Number(averageRating[0]) ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total de feedbacks</p>
          <h3 className="text-4xl font-bold text-slate-800">{feedbacks.length}</h3>
          <p className="text-sm text-slate-500 mt-2">Feedbacks carregados a partir dos dados reais disponíveis.</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFeedbacks.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFeedback(f)}
            className="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {f.client_name ? f.client_name.charAt(0) : '—'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{f.client_name || 'Cliente anônimo'}</h4>
                      <p className="text-xs text-slate-500">Entrega #{f.expedition_order_number ?? f.delivery_order_number ?? f.delivery_id} • {new Date(f.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={14} fill={index < Math.round(f.rating ?? 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Quote size={24} className="absolute -left-2 -top-2 text-slate-100 -z-0" />
                  <p className="text-slate-600 italic text-sm relative z-10 pl-4">{f.comment || 'Sem comentário'}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Entrega</span>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={12} fill={index < Math.round(f.delivery_rating ?? 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Instalação</span>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={12} fill={index < Math.round(f.installation_rating ?? 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Serviço</span>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={12} fill={index < Math.round(f.service_rating ?? 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Equip.</span>
                    <div className="flex gap-1 text-yellow-400">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={12} fill={index < Math.round(f.equipment_rating ?? 0) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                </div>
                {f.response && (
                  <div className="rounded-2xl bg-blue-50 p-4 text-sm text-slate-700 border border-blue-100">
                    <p className="font-semibold text-slate-900">Resposta enviada</p>
                    <p>{f.response}</p>
                  </div>
                )}
              </div>
              <div className="md:w-48 flex md:flex-col justify-between md:justify-center items-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleThanks(f.id);
                  }}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                    f.liked ? 'bg-blue-50 text-blue-600' : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ThumbsUp size={14} />
                  {f.liked ? 'Agradecido' : 'Agradecer'}
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReply(f.id);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageSquare size={14} />
                  {f.response ? 'Atualizar resposta' : 'Responder'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredFeedbacks.length === 0 && !loading && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
            Nenhum feedback corresponde à pesquisa.
          </div>
        )}
      </div>

      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Detalhes do Feedback</h3>
                <p className="text-sm text-slate-500">Visualize todas as informações deste feedback.</p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Fechar detalhes do feedback"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Cliente</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedFeedback.client_name || 'Cliente anônimo'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Entrega</p>
                  <p className="mt-2 font-semibold text-slate-800">#{selectedFeedback.expedition_order_number ?? selectedFeedback.delivery_order_number ?? selectedFeedback.delivery_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Expedição</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedFeedback.expedition_order_number ? `#${selectedFeedback.expedition_order_number}` : (selectedFeedback.expedition_id || 'Não informado')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Avaliações</p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'Entrega', value: selectedFeedback.delivery_rating ?? selectedFeedback.rating ?? 0 },
                      { label: 'Instalação', value: selectedFeedback.installation_rating ?? 0 },
                      { label: 'Serviço', value: selectedFeedback.service_rating ?? 0 },
                      { label: 'Equipamento', value: selectedFeedback.equipment_rating ?? 0 },
                    ].map((it) => (
                      <div key={it.label} className="flex flex-col items-start gap-2 p-3 bg-white rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase">{it.label}</p>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex gap-1 text-yellow-400">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star key={index} size={16} fill={index < Math.round(it.value) ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                          <div className="text-sm font-semibold text-slate-800">{Number(it.value ?? 0).toFixed(1)}/5</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-white">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Comentário</p>
                <p className="mt-3 text-slate-700">{selectedFeedback.comment || 'Sem comentário'}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5 bg-white">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Resposta</p>
                <p className="mt-3 text-slate-700">{selectedFeedback.response || 'Ainda não foi enviada resposta.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Agradecido</p>
                  <p className="mt-2 font-semibold text-slate-800">{selectedFeedback.liked ? 'Sim' : 'Não'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Criado em</p>
                  <p className="mt-2 font-semibold text-slate-800">{new Date(selectedFeedback.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ID do Feedback</p>
                  <p className="mt-2 font-semibold text-slate-800 break-all">{selectedFeedback.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <PromptDialog
        open={replyFeedbackId !== null}
        title="Responder feedback"
        description="Escreva uma resposta para o cliente:"
        label="Resposta"
        placeholder="Digite sua resposta aqui..."
        confirmText="Enviar"
        cancelText="Cancelar"
        onCancel={() => setReplyFeedbackId(null)}
        onSubmit={handleSubmitReply}
      />
    </div>
  );
};
