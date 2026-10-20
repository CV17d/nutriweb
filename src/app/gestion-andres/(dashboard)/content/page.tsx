'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from '../../../../components/RichTextEditor';

type WebSettings = Record<string, any>;
type SuccessCase = {
  id?: number;
  patient_name: string;
  comment: string;
  metrics: string;
  image_url: string;
  rating?: number;
};

export default function ContentPage() {
  const [settings, setSettings] = useState<WebSettings>({});
  const [cases, setCases] = useState<SuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for editing
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [originalHero, setOriginalHero] = useState({ title: '', subtitle: '' });
  
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  const [originalAbout, setOriginalAbout] = useState({ title: '', content: '' });

  const [editingCase, setEditingCase] = useState<SuccessCase | null>(null);

  // Reset modal state
  const [resetModal, setResetModal] = useState<'hero' | 'about' | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const fetchData = async () => {
    try {
      const [setRes, casRes] = await Promise.all([
        fetch('/api/admin/settings', { credentials: 'include' }),
        fetch('/api/admin/cases', { credentials: 'include' })
      ]);
      const setData = await setRes.json();
      const casData = await casRes.json();
      
      setSettings(setData);
      setCases(casData);

      if (setData.hero) {
        setHeroTitle(setData.hero.title || '');
        setHeroSubtitle(setData.hero.subtitle || '');
        setOriginalHero({ title: setData.hero.title || '', subtitle: setData.hero.subtitle || '' });
      }
      if (setData.about) {
        setAboutTitle(setData.about.title || '');
        setAboutContent(setData.about.content || '');
        setOriginalAbout({ title: setData.about.title || '', content: setData.about.content || '' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveSetting = async (key: string, newValue: any) => {
    try {
      const current = settings[key] || {};
      const value = { ...current, ...newValue };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) alert(`${key} guardado correctamente`);
      else alert(`Error al guardar ${key}`);
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;
    try {
      const isNew = !editingCase.id;
      const res = await fetch('/api/admin/cases', {
        method: isNew ? 'POST' : 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCase),
      });
      if (res.ok) {
        setEditingCase(null);
        fetchData();
      } else {
        alert('Error al guardar el testimonio');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const deleteCase = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este testimonio?')) return;
    try {
      const res = await fetch(`/api/admin/cases?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchData();
    } catch (error) {
      alert('Error de conexión');
    }
  };

  if (loading) return <div>Cargando contenido...</div>;

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Contenido</h1>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4 border-b pb-2">Sección Principal (Hero)</h2>
        <div className="space-y-4">
          <div>
            <RichTextEditor
              label="Título"
              value={heroTitle}
              onChange={setHeroTitle}
              multiline={false}
            />
          </div>
          <div>
            <RichTextEditor
              label="Subtítulo"
              value={heroSubtitle}
              onChange={setHeroSubtitle}
              multiline={true}
            />
          </div>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button onClick={() => saveSetting('hero', { title: heroTitle, subtitle: heroSubtitle })} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-xs sm:text-sm font-semibold shadow-xs">Guardar Hero</button>
            <button onClick={() => setResetModal('hero')} className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 text-xs sm:text-sm font-semibold shadow-xs">Restablecer</button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4 border-b pb-2">Sección Sobre Mí</h2>
        <div className="space-y-4">
          <div>
            <RichTextEditor
              label="Título"
              value={aboutTitle}
              onChange={setAboutTitle}
              multiline={false}
            />
          </div>
          <div>
            <RichTextEditor
              label="Contenido (Biografía)"
              value={aboutContent}
              onChange={setAboutContent}
              multiline={true}
            />
          </div>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button onClick={() => saveSetting('about', { title: aboutTitle, content: aboutContent })} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-xs sm:text-sm font-semibold shadow-xs">Guardar Sobre Mí</button>
            <button onClick={() => setResetModal('about')} className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 text-xs sm:text-sm font-semibold shadow-xs">Restablecer</button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b pb-3">
          <h2 className="text-lg sm:text-xl font-bold">Casos de Éxito (Testimonios)</h2>
          <button onClick={() => setEditingCase({ patient_name: '', comment: '', metrics: '', image_url: '', rating: 5 })} className="w-full sm:w-auto bg-green-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-green-700 text-xs sm:text-sm font-semibold shadow-xs text-center">+ Añadir Testimonio</button>
        </div>

        {editingCase && (
          <form onSubmit={handleSaveCase} className="mb-6 bg-gray-50 p-4 sm:p-5 rounded-2xl border space-y-4">
            <h3 className="font-bold text-base sm:text-lg">{editingCase.id ? 'Editar Testimonio' : 'Nuevo Testimonio'}</h3>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Nombre del Paciente</label>
              <input required type="text" value={editingCase.patient_name} onChange={e => setEditingCase({...editingCase, patient_name: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Testimonio</label>
              <textarea required rows={3} value={editingCase.comment} onChange={e => setEditingCase({...editingCase, comment: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Métricas logradas (opcional)</label>
              <input type="text" value={editingCase.metrics} onChange={e => setEditingCase({...editingCase, metrics: e.target.value})} className="w-full p-2.5 border rounded-xl text-sm" placeholder="-10kg, +5kg músculo..." />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Calificación (Estrellas)</label>
              <select value={editingCase.rating || 5} onChange={e => setEditingCase({...editingCase, rating: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-xl text-sm">
                <option value="5">5 Estrellas ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Estrellas ⭐⭐⭐⭐</option>
                <option value="3">3 Estrellas ⭐⭐⭐</option>
                <option value="2">2 Estrellas ⭐⭐</option>
                <option value="1">1 Estrella ⭐</option>
              </select>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setEditingCase(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium text-xs sm:text-sm text-center">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs sm:text-sm text-center">Guardar</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {cases.map(c => (
            <div key={c.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base">{c.patient_name} <span className="text-yellow-400 text-xs sm:text-sm">{'⭐'.repeat(c.rating || 5)}</span></h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">{c.comment}</p>
                {c.metrics && <p className="text-green-600 text-xs sm:text-sm font-bold mt-2">{c.metrics}</p>}
              </div>
              <div className="flex gap-3 shrink-0 self-end sm:self-start">
                <button onClick={() => setEditingCase(c)} className="text-blue-600 text-xs sm:text-sm font-semibold hover:underline">Editar</button>
                <button onClick={() => c.id && deleteCase(c.id)} className="text-red-600 text-xs sm:text-sm font-semibold hover:underline">Eliminar</button>
              </div>
            </div>
          ))}
          {cases.length === 0 && <p className="text-gray-500 text-sm">No hay testimonios aún.</p>}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Restauración</h3>
            <p className="text-sm text-gray-600 mb-4">
              Para confirmar, escribe la palabra <strong>confirmar</strong>:
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="confirmar"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setResetModal(null);
                  setResetConfirmText('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (resetConfirmText.trim().toLowerCase() === 'confirmar') {
                    if (resetModal === 'hero') {
                      setHeroTitle('Convierte tu <br class="hidden md:block" /><span class="text-brand-electric">alimentación</span> en una <br class="hidden lg:block" />ventaja competitiva');
                      setHeroSubtitle('Planes nutricionales precisos y personalizados para atletas y entusiastas del fitness que buscan optimizar su rendimiento, composición corporal y recuperación.');
                    } else if (resetModal === 'about') {
                      setAboutTitle('<span class="text-brand-electric">Nutricionista Deportivo</span>, <br class="hidden md:block" />Entrenador y Chef Profesional');
                      setAboutContent('Soy Andrés Burbano. Mi objetivo no es únicamente ayudarte a mejorar tu alimentación, sino utilizar la nutrición como una herramienta para potenciar tu rendimiento, optimizar tu composición corporal y construir hábitos que puedas mantener en el tiempo. Trabajo con deportistas de alto rendimiento, futbolistas, atletas recreativos y personas que desean mejorar su salud mediante un enfoque basado en evidencia científica y completamente personalizado.<br><br>Cada plan nutricional comienza con una evaluación integral que me permite comprender cómo funciona tu cuerpo, cuáles son tus objetivos y qué estrategias son las más adecuadas para alcanzarlos. Actualmente colaboro con procesos de nutrición deportiva en fútbol formativo y continúo formándome de manera constante para ofrecer intervenciones respaldadas por la ciencia y adaptadas a las necesidades reales de cada paciente.');
                    }
                    alert('Campos restaurados a valores predeterminados');
                    setResetModal(null);
                    setResetConfirmText('');
                  } else {
                    alert('Palabra incorrecta. Por favor, escribe "confirmar".');
                  }
                }}
                className="bg-brand-electric text-white px-4 py-2 rounded-md hover:opacity-90 text-sm font-medium"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
