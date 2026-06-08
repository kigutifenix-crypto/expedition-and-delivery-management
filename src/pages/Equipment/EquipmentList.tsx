
import React, { useMemo, useState } from 'react';
import { Dumbbell, Search, Plus, Filter } from 'lucide-react';

type Equipment = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: string;
};

const initialEquipment: Equipment[] = [
  { id: '1', name: 'Esteira Profissional X1', sku: 'EST-001', stock: 12, price: 'R$ 12.500' },
  { id: '2', name: 'Bike Spinning Z Pro', sku: 'BIK-045', stock: 8, price: 'R$ 4.200' },
  { id: '3', name: 'Estação Musculação G3', sku: 'EST-089', stock: 5, price: 'R$ 18.900' },
];

export const EquipmentList = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', sku: '', stock: 0, price: '' });

  const filteredEquipment = useMemo(
    () =>
      equipment.filter((item) => {
        const query = search.toLowerCase();
        const matchesSearch = [item.name, item.sku].some((value) => value.toLowerCase().includes(query));
        const matchesStock = stockFilter === 'all' ? true : item.stock > 0;
        return matchesSearch && matchesStock;
      }),
    [equipment, search, stockFilter]
  );

  const handleAddEquipment = () => {
    if (!newEquipment.name.trim() || !newEquipment.sku.trim()) {
      alert('Preencha nome e SKU para cadastrar o equipamento.');
      return;
    }
    setEquipment((current) => [
      ...current,
      { id: Date.now().toString(), name: newEquipment.name, sku: newEquipment.sku, stock: newEquipment.stock, price: newEquipment.price || 'R$ 0,00' },
    ]);
    setNewEquipment({ name: '', sku: '', stock: 0, price: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Equipamentos</h2>
          <p className="text-sm text-slate-500">Gerencie o estoque de itens e cadastre novos produtos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowAddForm((prev) => !prev)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Plus size={18} />
            {showAddForm ? 'Cancelar' : 'Novo Equipamento'}
          </button>
          <button onClick={() => setStockFilter((prev) => (prev === 'all' ? 'inStock' : 'all'))} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Filter size={18} />
            {stockFilter === 'all' ? 'Filtrar em estoque' : 'Mostrar todos'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Adicionar novo equipamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={newEquipment.name}
              onChange={(event) => setNewEquipment((current) => ({ ...current, name: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Nome"
            />
            <input
              value={newEquipment.sku}
              onChange={(event) => setNewEquipment((current) => ({ ...current, sku: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="SKU"
            />
            <input
              value={newEquipment.stock}
              onChange={(event) => setNewEquipment((current) => ({ ...current, stock: Number(event.target.value) }))}
              type="number"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Estoque"
            />
            <input
              value={newEquipment.price}
              onChange={(event) => setNewEquipment((current) => ({ ...current, price: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="Preço"
            />
          </div>
          <button onClick={handleAddEquipment} className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
            Salvar equipamento
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg outline-none"
              placeholder="Buscar equipamento..."
            />
          </div>
          <div className="text-sm text-slate-500">{filteredEquipment.length} equipamento(s) encontrado(s)</div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Equipamento</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Estoque</th>
              <th className="px-6 py-4">Preço Sugerido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEquipment.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center"><Dumbbell size={16} /></div>
                  <span className="font-bold text-slate-800">{item.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{item.sku}</td>
                <td className="px-6 py-4 text-sm font-bold">{item.stock} un</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
