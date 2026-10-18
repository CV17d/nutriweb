'use client';

import { useState, useEffect } from 'react';

type Patient = {
  id: string;
  name: string;
  email: string;
  plan_name: string;
  sessions_remaining: number;
  total_sessions: number;
  status: string;
  subscription_id: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingLink, setSendingLink] = useState<string | null>(null);
  
  // Selección y borrado
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/admin/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.error('API returned non-array:', data);
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const sendAgendaLink = async (userId: string, subscriptionId: string) => {
    setSendingLink(subscriptionId);
    try {
      const res = await fetch('/api/admin/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, subscription_id: subscriptionId }),
      });
      
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || '✅ Enlace enviado correctamente al correo del paciente');
      } else if (res.status === 401) {
        alert('⚠️ Tu sesión de administrador ha caducado por inactividad. Por favor, vuelve a iniciar sesión.');
        window.location.href = '/admin/login?reason=expired';
      } else {
        alert(`❌ ${data.message || data.error || 'Error al enviar el enlace. Intenta de nuevo.'}`);
      }
    } catch (error: any) {
      alert(`❌ Error de conexión: ${error.message || 'No se pudo conectar con el servidor. Revisa tu acceso a internet.'}`);
    } finally {
      setSendingLink(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === patients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(patients.map(p => p.subscription_id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionIds: selectedIds })
      });
      
      if (res.ok) {
        alert('Pacientes eliminados correctamente');
        setSelectedIds([]);
        setIsModalOpen(false);
        fetchPatients();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar pacientes');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div>Cargando pacientes...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Control de Pacientes</h1>
        
        {selectedIds.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors text-sm"
          >
            Borrar Seleccionados ({selectedIds.length})
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow overflow-x-auto w-full border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-brand-electric focus:ring-brand-electric"
                  checked={patients.length > 0 && selectedIds.length === patients.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesiones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.subscription_id} className={selectedIds.includes(patient.subscription_id) ? 'bg-red-50' : ''}>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-brand-electric focus:ring-brand-electric"
                    checked={selectedIds.includes(patient.subscription_id)}
                    onChange={() => toggleSelect(patient.subscription_id)}
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{patient.email}</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {patient.plan_name}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {patient.sessions_remaining} / {patient.total_sessions}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                  <button
                    onClick={() => sendAgendaLink(patient.id, patient.subscription_id)}
                    disabled={sendingLink === patient.subscription_id || patient.status !== 'active'}
                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg disabled:opacity-50 text-xs font-semibold shadow-xs transition-colors"
                  >
                    {sendingLink === patient.subscription_id ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">
                  No hay pacientes activos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación Segura */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6">
            <h2 id="modal-delete-title" className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Confirmar Eliminación</h2>
            <p className="text-gray-600 text-xs sm:text-sm mb-6 leading-relaxed">
              Estás a punto de eliminar definitivamente <strong>{selectedIds.length}</strong> paciente(s) y sus citas asociadas. 
              Esta acción no se puede deshacer.
            </p>
            
            <form onSubmit={handleDelete}>
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium text-xs sm:text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-bold disabled:opacity-50 text-xs sm:text-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
                >
                  {isDeleting ? 'Borrando...' : 'Confirmar Borrado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
