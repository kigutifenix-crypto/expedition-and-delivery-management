
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Dumbbell className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-slate-800">FitLog</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold leading-tight">Logística Fitness</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm">Acesse o sistema de gestão de expedição e entregas.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              &copy; 2024 FitLog Logística de Equipamentos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
