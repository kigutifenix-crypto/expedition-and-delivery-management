import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail, ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const highlights = [
  { icon: Truck, title: 'Expedição rastreada', text: 'Da separação à entrega, com histórico completo por NF.' },
  { icon: ShieldCheck, title: 'Garantias sob controle', text: 'Prazos, acionamentos e status ativos em um só painel.' },
  { icon: Star, title: 'Feedback do cliente', text: 'Avaliações consolidadas para elevar o nível do serviço.' },
];

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
      setErrorMessage('Não foi possível entrar. Verifique e-mail e senha.');
      setLoading(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-700 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #ffffff 0, transparent 45%), radial-gradient(circle at 85% 70%, #5f8cfa 0, transparent 50%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/12 ring-1 ring-white/25">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold">FitLog</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-100">Logística Fitness</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
            A operação de entregas inteira, sem planilha nenhuma.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-100">
            Centralize expedições, entregas, garantias e feedbacks com rastreio ponta a ponta.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/12 ring-1 ring-white/20">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-[13px] leading-snug text-brand-100">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-brand-200">© {new Date().getFullYear()} FitLog Logística de Equipamentos</p>
      </aside>

      {/* Formulário */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-700 text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[17px] font-bold text-ink">FitLog</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">Logística Fitness</p>
            </div>
          </div>

          <p className="text-eyebrow mb-2">Acesso restrito</p>
          <h1 className="text-[26px] font-bold leading-tight text-ink">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Entre para acompanhar a expedição e as entregas do dia.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <Input
              label="E-mail corporativo"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              icon={<Mail size={16} />}
              required
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="label-field">Senha</span>
                <a href="#" className="mb-1.5 text-[12px] font-semibold text-brand-600 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                required
              />
            </div>

            {errorMessage && (
              <p className="rounded-[10px] border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
                {errorMessage}
              </p>
            )}

            <Button type="submit" size="lg" isLoading={loading} className="w-full">
              Entrar no sistema
              <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-8 border-t border-line pt-6 text-[12px] leading-relaxed text-ink-faint">
            Ambiente monitorado. O uso das credenciais é individual e registrado.
          </p>
        </div>
      </main>
    </div>
  );
};
