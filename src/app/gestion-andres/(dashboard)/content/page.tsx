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
  before_image_url?: string;
  after_image_url?: string;
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
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  // Reset modal state
  const [resetModal, setResetModal] = useState<'hero' | 'about' | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const fetchData = async () => {
    try {
      const [setRes, casRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/cases')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) alert(`${key} guardado correctamente`);
      else alert(`Error al guardar ${key}`);
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleCaseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'before_image_url' | 'after_image_url') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (field === 'before_image_url') setUploadingBefore(true);
    if (field === 'after_image_url') setUploadingAfter(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al subir la imagen');
      }

      const data = await res.json();
      setEditingCase(prev => prev ? { ...prev, [field]: data.url } : prev);
    } catch (error: any) {
      alert(error.message || 'Error al subir la imagen');
    } finally {
      if (field === 'before_image_url') setUploadingBefore(false);
      if (field === 'after_image_url') setUploadingAfter(false);
      e.target.value = '';
    }
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;
    try {
      const isNew = !editingCase.id;
      const res = await fetch('/api/admin/cases', {
        method: isNew ? 'POST' : 'PUT',
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
      const res = await fetch(`/api/admin/cases?id=${id}`, { method: 'DELETE' });
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
          <button onClick={() => setEditingCase({ patient_name: '', comment: '', metrics: '', image_url: '', before_image_url: '', after_image_url: '', rating: 5 })} className="w-full sm:w-auto bg-green-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-green-700 text-xs sm:text-sm font-semibold shadow-xs text-center">+ Añadir Testimonio</button>
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

            {/* Fotos de Transformación (Antes y Después) */}
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
                Fotos de Transformación (Antes y Después)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Sube las fotos que muestren los resultados del paciente. Aparecerán comparadas en el testimonio.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Foto del Antes */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      Foto del Antes
                    </span>
                    {editingCase.before_image_url && (
                      <button
                        type="button"
                        onClick={() => setEditingCase({ ...editingCase, before_image_url: '' })}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {editingCase.before_image_url ? (
                    <div className="relative aspect-video sm:aspect-square w-full rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={editingCase.before_image_url}
                        alt="Foto Antes"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-brand-electric hover:bg-blue-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center aspect-video sm:aspect-square">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleCaseImageUpload(e, 'before_image_url')}
                        disabled={uploadingBefore}
                        className="hidden"
                      />
                      {uploadingBefore ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-6 h-6 border-2 border-brand-electric border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-xs text-brand-electric font-medium">Subiendo foto...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-brand-navy">Subir Foto del Antes</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG o WebP (máx. 5MB)</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {/* Foto del Después */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Foto del Después
                    </span>
                    {editingCase.after_image_url && (
                      <button
                        type="button"
                        onClick={() => setEditingCase({ ...editingCase, after_image_url: '' })}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {editingCase.after_image_url ? (
                    <div className="relative aspect-video sm:aspect-square w-full rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={editingCase.after_image_url}
                        alt="Foto Después"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-green-600 hover:bg-green-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center aspect-video sm:aspect-square">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleCaseImageUpload(e, 'after_image_url')}
                        disabled={uploadingAfter}
                        className="hidden"
                      />
                      {uploadingAfter ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-xs text-green-600 font-medium">Subiendo foto...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-brand-navy">Subir Foto del Después</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG o WebP (máx. 5MB)</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
              <button type="button" onClick={() => setEditingCase(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium text-xs sm:text-sm text-center">Cancelar</button>
              <button type="submit" disabled={uploadingBefore || uploadingAfter} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs sm:text-sm text-center disabled:opacity-50">Guardar</button>
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

                {/* Previsualización en lista de antes y después */}
                {(c.before_image_url || c.after_image_url) && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100 flex-wrap">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fotos:</span>
                    {c.before_image_url && (
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 pl-1 pr-2 py-0.5 rounded-lg">
                        <img src={c.before_image_url} alt="Antes" className="w-6 h-6 rounded object-cover" />
                        <span className="text-[11px] font-semibold text-slate-700">Antes</span>
                      </div>
                    )}
                    {c.after_image_url && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 pl-1 pr-2 py-0.5 rounded-lg">
                        <img src={c.after_image_url} alt="Después" className="w-6 h-6 rounded object-cover" />
                        <span className="text-[11px] font-semibold text-emerald-700">Después</span>
                      </div>
                    )}
                  </div>
                )}
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
