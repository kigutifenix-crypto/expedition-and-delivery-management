
import React, { useEffect, useMemo, useState } from 'react';
import { User, Shield, Plus, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Ativo' | 'Em Entrega' | 'Bloqueado';
};

export const UserList = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'motorista' });
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from<UserItem>('users').select('*').order('name');
      if (error) {
        console.error('Falha ao carregar usuários reais:', error.message);
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        [user.name, user.email, user.role].some((value) => value.toLowerCase().includes(query.toLowerCase()))
      ),
    [users, query]
  );

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      alert('Informe nome, e-mail e senha para cadastrar o usuário.');
      return;
    }

    setSavingUser(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });

    if (authError) {
      console.error('Erro ao criar conta de autenticação:', authError.message);
      alert('Não foi possível criar a conta de autenticação. Verifique o e-mail e tente novamente.');
      setSavingUser(false);
      return;
    }

    const authUserId = authData.user?.id || null;
    const payload = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Ativo',
      auth_id: authUserId,
    };

    const { data, error } = await supabase
      .from<UserItem>('users')
      .insert([payload])
      .select('*');

    if (error) {
      console.error('Erro ao criar usuário:', error.message);
      alert('Não foi possível salvar o usuário no cadastro.');
      setSavingUser(false);
      return;
    }

    if (data && data.length > 0) {
      setUsers((current) => [...current, data[0]]);
    } else {
      setUsers((current) => [
        ...current,
        { id: Date.now().toString(), name: newUser.name, email: newUser.email, role: newUser.role, status: 'Ativo' },
      ]);
    }

    setNewUser({ name: '', email: '', password: '', role: 'motorista' });
    setShowAdd(false);
    setSavingUser(false);
  };

  const toggleBlock = (id: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: user.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado' } : user
      )
    );
  };

  const handleEdit = (id: string) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const newName = window.prompt('Editar nome do usuário', user.name);
    if (!newName) return;
    setUsers((current) => current.map((item) => (item.id === id ? { ...item, name: newName } : item)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
          <p className="text-sm text-slate-500">Crie e gerencie permissões dos membros do time.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => setShowAdd((prev) => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            {showAdd ? 'Cancelar' : 'Novo Usuário'}
          </button>
          <div className="relative w-full sm:w-72">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
              placeholder="Buscar usuário..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-500 text-sm">
          Carregando usuários reais...
        </div>
      ) : null}

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Cadastrar novo usuário</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={newUser.name}
              onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              value={newUser.email}
              onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
              placeholder="E-mail"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
              placeholder="Senha"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
            />
            <select
              value={newUser.role}
              onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="motorista">Motorista</option>
              <option value="expedicao">Expedição</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            onClick={handleAddUser}
            disabled={savingUser}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
          >
            {savingUser ? 'Salvando...' : 'Salvar Usuário'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div key={u.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 uppercase font-bold text-xl">
                {u.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{u.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase">{u.role}</span>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Mail size={14} /> {u.email}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Shield size={14} /> Status: <span className={u.status === 'Ativo' ? 'text-green-600 font-bold' : u.status === 'Bloqueado' ? 'text-red-600 font-bold' : 'text-blue-600 font-bold'}>{u.status}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleEdit(u.id)}
                className="flex-1 py-1.5 bg-slate-50 text-slate-600 rounded text-xs font-bold hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                onClick={() => toggleBlock(u.id)}
                className="flex-1 py-1.5 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100"
              >
                {u.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
