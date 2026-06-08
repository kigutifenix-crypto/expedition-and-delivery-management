
import React, { useMemo, useState } from 'react';
import { FileText, Download, Calendar, Search, Filter, FileSpreadsheet, FileJson } from 'lucide-react';

const reportTemplates = [
  { title: 'Relatório de Entregas', desc: 'Resumo completo de todas as entregas e NFs.', icon: FileText, color: 'blue' },
  { title: 'Índice de Avarias', desc: 'Análise de problemas relatados no checklist.', icon: FileSpreadsheet, color: 'red' },
  { title: 'Performance Transportadora', desc: 'Prazos e qualidades por transportadora.', icon: FileJson, color: 'green' },
];

const colorStyles: Record<string, { wrapper: string; icon: string }> = {
  blue: { wrapper: 'bg-blue-50 text-blue-600', icon: 'text-blue-600' },
  red: { wrapper: 'bg-red-50 text-red-600', icon: 'text-red-600' },
  green: { wrapper: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-600' },
};

export const Reports = () => {
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [status, setStatus] = useState('Todos');
  const [expeditor, setExpeditor] = useState('');
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const filteredReports = useMemo(
    () =>
      reportTemplates.filter((item) => {
        const search = expeditor.toLowerCase();
        const matchesStatus = status === 'Todos' || item.title.includes(status);
        const matchesExpeditor = !search || item.title.toLowerCase().includes(search) || item.desc.toLowerCase().includes(search);
        return matchesStatus && matchesExpeditor;
      }),
    [expeditor, status]
  );

  const handleApplyFilters = () => {
    if (filteredReports.length > 0) {
      setActivePreview(filteredReports[0].title);
    } else {
      setActivePreview(null);
      alert('Nenhum relatório corresponde aos seus filtros.');
    }
  };

  const downloadTextFile = (type: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${type.toLowerCase().replace(/\s/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = (format: 'PDF' | 'Excel') => {
    downloadTextFile(format, `Relatório gerado em ${format}\nPeríodo: ${period}\nStatus: ${status}\nExpedidor: ${expeditor || 'Todos'}`);
  };

  const handleDownload = (title: string) => {
    downloadTextFile(title, `Download do relatório: ${title}\nPeríodo: ${period}\nStatus: ${status}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios de Logística</h2>
        <p className="text-slate-500">Gere relatórios personalizados e exporte dados da operação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Filter size={18} className="text-blue-600" />
              Filtros
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Período</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  >
                    <option>Últimos 30 dias</option>
                    <option>Este Mês</option>
                    <option>Último Trimestre</option>
                    <option>Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Status da Entrega</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                >
                  <option>Todos</option>
                  <option>Concluídas</option>
                  <option>Em Trânsito</option>
                  <option>Pendentes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Expedidor</label>
                <input
                  value={expeditor}
                  onChange={(event) => setExpeditor(event.target.value)}
                  type="text"
                  placeholder="Nome do expedidor"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
              </div>
            </div>

            <button onClick={handleApplyFilters} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-100 mt-4">
              Aplicar Filtros
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className={`${colorStyles[item.color].wrapper} rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(item.title)} className="p-2 bg-slate-50 text-slate-600 rounded hover:bg-slate-100">
                    <Download size={16} />
                  </button>
                  <button onClick={() => setActivePreview(item.title)} className="flex-1 py-1.5 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-800">
                    Visualizar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Visualização Prévia (Top 5)</h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport('PDF')} className="text-xs font-bold text-blue-600">Exportar PDF</button>
                <button onClick={() => handleExport('Excel')} className="text-xs font-bold text-green-600">Exportar Excel</button>
              </div>
            </div>
            <div className="p-8 text-center space-y-4">
              {activePreview ? (
                <>
                  <div className="text-left max-w-3xl mx-auto space-y-3">
                    <h4 className="font-bold text-slate-800">Prévia: {activePreview}</h4>
                    <p className="text-sm text-slate-500">Período: {period}</p>
                    <p className="text-sm text-slate-500">Status: {status}</p>
                    <p className="text-sm text-slate-500">Expedidor: {expeditor || 'Todos'}</p>
                    <ul className="mt-4 text-slate-700 text-sm list-disc list-inside space-y-2">
                      <li>Dados de entrega, NF e transportadora agrupados.</li>
                      <li>Resumo de avarias e horários de coleta.</li>
                      <li>Comparativo de performance por rota.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Configure os filtros ao lado</p>
                    <p className="text-sm text-slate-500">Gere uma prévia dos dados antes de exportar o arquivo final.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
