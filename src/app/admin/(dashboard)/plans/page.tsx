'use client';

import { useState, useEffect } from 'react';

type Plan = {
  id?: number;
  name: string;
  price: number;
  duration_months: number;
  description: string;
  total_sessions: number;
  is_active: boolean;
  is_recommended: boolean;
  features: string[];
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const isNew = !editingPlan.id;
      const res = await fetch('/api/admin/plans', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan),
      });

      if (res.ok) {
        setEditingPlan(null);
        fetchPlans();
      } else {
        alert('Error al guardar el plan');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) return;

    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        if (data.message) {
          alert(data.message);
        }
        fetchPlans();
      } else {
        alert(data.error || 'Error al eliminar el plan');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div>Cargando planes...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
        <button 
          onClick={() => setEditingPlan({ name: '', price: 0, duration_months: 1, description: '', total_sessions: 1, is_active: true, is_recommended: false, features: [] })}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Añadir Plan
        </button>
      </div>

      {editingPlan ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">{editingPlan.id ? 'Editar Plan' : 'Nuevo Plan'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" required value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (USD/EUR)</label>
                <input type="number" step="0.01" required value={editingPlan.price} onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duración (Meses)</label>
                <input type="number" required value={editingPlan.duration_months} onChange={(e) => setEditingPlan({...editingPlan, duration_months: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sesiones Totales</label>
                <input type="number" required value={editingPlan.total_sessions} onChange={(e) => setEditingPlan({...editingPlan, total_sessions: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
              <input type="text" required value={editingPlan.description} onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Características (Separadas por comas)</label>
              <textarea 
                rows={3} 
                value={editingPlan.features.join(', ')} 
                onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(f => f.trim()).filter(f => f)})} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                placeholder="Ej: Plan personalizado, Acceso a WhatsApp, ..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="checkbox" checked={editingPlan.is_recommended} onChange={(e) => setEditingPlan({...editingPlan, is_recommended: e.target.checked})} className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 mr-2" />
                <span className="text-sm font-medium text-gray-700">¿Recomendado / Popular?</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={editingPlan.is_active} onChange={(e) => setEditingPlan({...editingPlan, is_active: e.target.checked})} className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 mr-2" />
                <span className="text-sm font-medium text-gray-700">Activo (Visible)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Guardar Plan</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-lg shadow-sm border ${plan.is_recommended ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'} p-6 relative flex flex-col`}>
            {!plan.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Inactivo</div>
            )}
            {plan.is_recommended && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Recomendado</div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">${plan.price}</p>
            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setEditingPlan(plan)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm text-center"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(plan.id)} 
                className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors text-sm text-center flex items-center justify-center gap-1 border border-red-200"
                title="Eliminar Plan"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
