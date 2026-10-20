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
      const res = await fetch('/api/admin/plans', {
        credentials: 'include',
      });
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
        credentials: 'include',
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
        credentials: 'include',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Planes</h1>
        <button 
          onClick={() => setEditingPlan({ name: '', price: 0, duration_months: 1, description: '', total_sessions: 1, is_active: true, is_recommended: false, features: [] })}
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 font-semibold text-sm shadow-xs transition-colors text-center"
        >
          + Añadir Plan
        </button>
      </div>

      {editingPlan ? (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold mb-4">{editingPlan.id ? 'Editar Plan' : 'Nuevo Plan'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" required value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Precio (USD/EUR)</label>
                <input type="number" step="0.01" required value={editingPlan.price} onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})} className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Duración (Meses)</label>
                <input type="number" required value={editingPlan.duration_months} onChange={(e) => setEditingPlan({...editingPlan, duration_months: parseInt(e.target.value)})} className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sesiones Totales</label>
                <input type="number" required value={editingPlan.total_sessions} onChange={(e) => setEditingPlan({...editingPlan, total_sessions: parseInt(e.target.value)})} className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
              <input type="text" required value={editingPlan.description} onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})} className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border" />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Características (Separadas por comas)</label>
              <textarea 
                rows={3} 
                value={editingPlan.features.join(', ')} 
                onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value.split(',').map(f => f.trim()).filter(f => f)})} 
                className="block w-full rounded-xl border-gray-300 shadow-xs focus:border-green-500 focus:ring-green-500 text-sm p-2.5 border"
                placeholder="Ej: Plan personalizado, Acceso a WhatsApp, ..."
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={editingPlan.is_recommended} onChange={(e) => setEditingPlan({...editingPlan, is_recommended: e.target.checked})} className="rounded border-gray-300 text-green-600 shadow-xs focus:ring-green-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">¿Recomendado / Popular?</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={editingPlan.is_active} onChange={(e) => setEditingPlan({...editingPlan, is_active: e.target.checked})} className="rounded border-gray-300 text-green-600 shadow-xs focus:ring-green-500 mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Activo (Visible)</span>
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setEditingPlan(null)} className="px-4 py-2.5 border border-gray-300 shadow-xs text-xs sm:text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 text-center">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 border border-transparent shadow-xs text-xs sm:text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 text-center">Guardar Plan</button>
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
