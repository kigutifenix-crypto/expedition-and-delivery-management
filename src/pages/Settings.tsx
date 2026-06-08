import React from 'react';

export const Settings = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
          <p className="text-slate-500">Gerencie as preferências do aplicativo e notificações.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Preferências Gerais</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">Modo escuro</p>
                <p className="text-sm text-slate-500">Ative o tema escuro para trabalhar à noite.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold">Alterar</button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">Idioma</p>
                <p className="text-sm text-slate-500">Português (Brasil)</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold">Editar</button>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Notificações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">Notificações por e-mail</p>
                <p className="text-sm text-slate-500">Receba atualizações de status por e-mail.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold">Gerenciar</button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">Alertas de entrega</p>
                <p className="text-sm text-slate-500">Ative avisos em tempo real sobre entregas.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold">Gerenciar</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
