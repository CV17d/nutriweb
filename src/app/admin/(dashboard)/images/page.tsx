'use client';

import { useState, useEffect } from 'react';

type WebSettings = Record<string, any>;

interface ClinicPhoto {
  id: number;
  image_url: string;
  caption: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export default function ImagesPage() {
  const [activeTab, setActiveTab] = useState<'consultorio' | 'principales'>('consultorio');

  // Settings para Hero y About
  const [settings, setSettings] = useState<WebSettings>({});
  const [loading, setLoading] = useState(true);
  const [uploadingSetting, setUploadingSetting] = useState<string | null>(null);

  // Estados para Fotos del Consultorio
  const [clinicPhotos, setClinicPhotos] = useState<ClinicPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Modal para agregar foto
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoOrder, setNewPhotoOrder] = useState<number>(1);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Modal para eliminar foto
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edición rápida de texto/caption
  const [editingCaptionId, setEditingCaptionId] = useState<number | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);

  // Cargar configuraciones generales y fotos del consultorio
  const fetchData = async () => {
    try {
      const [settingsRes, photosRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/clinic-photos')
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
      }

      if (photosRes.ok) {
        const pData = await photosRes.json();
        setClinicPhotos(pData);
        setNewPhotoOrder((pData.length || 0) + 1);
      }
    } catch (error) {
      console.error('Error fetching admin images data:', error);
    } finally {
      setLoading(false);
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejo de subida para Hero / About
  const handleSettingUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingSetting(key);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'images');
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al subir imagen');
      }
      
      const { url } = await res.json();
      
      const currentSetting = settings[key] || {};
      const updatedValue = { ...currentSetting, imageUrl: url };
      
      const saveRes = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: updatedValue }),
      });
      
      if (saveRes.ok) {
        setSettings({ ...settings, [key]: updatedValue });
        alert('Imagen actualizada correctamente');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingSetting(null);
    }
  };

  // Manejo de archivo seleccionado para nueva foto de consultorio
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setNewPhotoFile(null);
      setPreviewUrl(null);
      return;
    }
    const file = e.target.files[0];
    setNewPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Guardar nueva foto en el carrusel del consultorio
  const handleAddClinicPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPhoto(true);

    try {
      let finalImageUrl = newPhotoUrl.trim();

      // Si se subió un archivo físico, subirlo primero al bucket
      if (newPhotoFile) {
        const formData = new FormData();
        formData.append('file', newPhotoFile);
        formData.append('bucket', 'images');

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || 'Error al procesar la imagen en el servidor');
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      if (!finalImageUrl) {
        alert('Por favor selecciona una imagen de tu dispositivo o ingresa una URL válida.');
        setIsUploadingPhoto(false);
        return;
      }

      // Guardar registro en la tabla clinic_photos
      const res = await fetch('/api/admin/clinic-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: finalImageUrl,
          caption: newPhotoCaption.trim(),
          display_order: Number(newPhotoOrder) || clinicPhotos.length + 1,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al guardar la foto en la base de datos');
      }

      // Limpiar formulario y recargar
      setIsAddModalOpen(false);
      setNewPhotoFile(null);
      setNewPhotoUrl('');
      setNewPhotoCaption('');
      setPreviewUrl(null);
      await fetchData();
      alert('Foto agregada con éxito al carrusel del consultorio');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al agregar foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Quitar / Eliminar foto
  const handleConfirmDelete = async () => {
    if (!deletingPhotoId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/clinic-photos?id=${deletingPhotoId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo eliminar la foto');
      }

      setClinicPhotos((prev) => prev.filter((p) => p.id !== deletingPhotoId));
      setDeletingPhotoId(null);
      alert('Foto eliminada del carrusel');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al eliminar la foto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Guardar edición rápida de texto/caption
  const handleSaveCaption = async (id: number) => {
    setIsSavingCaption(true);
    try {
      const res = await fetch('/api/admin/clinic-photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          caption: editingCaptionText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar el texto');
      }

      setClinicPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, caption: editingCaptionText.trim() } : p))
      );
      setEditingCaptionId(null);
      setEditingCaptionText('');
    } catch (error: any) {
      console.error(error);
      alert('Error al guardar el texto de la foto');
    } finally {
      setIsSavingCaption(false);
    }
  };

  // Cambiar orden (Mover arriba / abajo)
  const handleMoveOrder = async (photo: ClinicPhoto, direction: 'up' | 'down') => {
    const sorted = [...clinicPhotos].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sorted.findIndex((p) => p.id === photo.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetPhoto = sorted[targetIndex];
    const currentOrder = photo.display_order;
    const targetOrder = targetPhoto.display_order === currentOrder 
      ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1)
      : targetPhoto.display_order;

    try {
      // Intercambiar órdenes
      await Promise.all([
        fetch('/api/admin/clinic-photos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: photo.id, display_order: targetOrder }),
        }),
        fetch('/api/admin/clinic-photos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetPhoto.id, display_order: currentOrder }),
        }),
      ]);

      await fetchData();
    } catch (error) {
      console.error('Error reordering photos:', error);
      alert('Error al reordenar fotos');
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleActive = async (photo: ClinicPhoto) => {
    try {
      const res = await fetch('/api/admin/clinic-photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: photo.id,
          is_active: !photo.is_active,
        }),
      });

      if (res.ok) {
        setClinicPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, is_active: !photo.is_active } : p))
        );
      }
    } catch (error) {
      alert('Error al actualizar visibilidad de la foto');
    }
  };

  if (loading && loadingPhotos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Cargando gestor de imágenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Gestión de Imágenes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las fotos del consultorio (carrusel), la imagen principal y tu foto de perfil.
          </p>
        </div>

        {activeTab === 'consultorio' && (
          <button
            onClick={() => {
              setNewPhotoOrder(clinicPhotos.length + 1);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-electric hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
            Agregar Foto al Consultorio
          </button>
        )}
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('consultorio')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'consultorio'
              ? 'border-brand-electric text-brand-electric bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">view_carousel</span>
          Fotos del Consultorio (Carrusel)
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
            {clinicPhotos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('principales')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'principales'
              ? 'border-brand-electric text-brand-electric bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          Imágenes Web (Hero & Sobre Mí)
        </button>
      </div>

      {/* PESTAÑA 1: FOTOS DEL CONSULTORIO (CARRUSEL) */}
      {activeTab === 'consultorio' && (
        <div className="space-y-6">
          {/* Banner Informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-electric text-2xl mt-0.5">info</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Carrusel de la Sección "Consultorio y Ubicación"
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Las fotos registradas aquí se visualizan dinámicamente en el carrusel de la página de inicio junto al texto descriptivo que asignes debajo de cada una.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNewPhotoOrder(clinicPhotos.length + 1);
                setIsAddModalOpen(true);
              }}
              className="shrink-0 px-4 py-2 bg-white text-brand-electric border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100/50 transition-colors shadow-xs"
            >
              + Agregar Nueva Foto
            </button>
          </div>

          {/* Listado de Fotos */}
          {clinicPhotos.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-electric flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">photo_library</span>
              </div>
              <h3 className="text-base font-bold text-gray-800">No hay fotos en el carrusel aún</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
                Agrega fotos de alta calidad de tu consultorio médico, equipamiento y áreas de atención presencial.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-brand-electric hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                Agregar Primera Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md ${
                    photo.is_active ? 'border-gray-200' : 'border-amber-200 bg-amber-50/20 opacity-80'
                  }`}
                >
                  {/* Vista Previa de la Imagen (formato vertical 4:5) */}
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden group">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || 'Foto de consultorio'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge de Orden */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1">
                      <span>#{photo.display_order}</span>
                    </div>

                    {/* Botones de orden arriba / abajo */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(photo, 'up')}
                        disabled={index === 0}
                        className={`w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-all ${
                          index === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                        }`}
                        title="Mover foto antes"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => handleMoveOrder(photo, 'down')}
                        disabled={index === clinicPhotos.length - 1}
                        className={`w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-all ${
                          index === clinicPhotos.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
                        }`}
                        title="Mover foto después"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                    </div>

                    {/* Badge de visibilidad */}
                    <div className="absolute bottom-3 left-3">
                      <button
                        onClick={() => handleToggleActive(photo)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-sm transition-all ${
                          photo.is_active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                        title="Clic para cambiar visibilidad"
                      >
                        {photo.is_active ? 'Visible en web' : 'Oculta'}
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo: Texto Descriptivo (Caption) */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Texto bajo la foto
                        </span>
                        {editingCaptionId !== photo.id && (
                          <button
                            onClick={() => {
                              setEditingCaptionId(photo.id);
                              setEditingCaptionText(photo.caption || '');
                            }}
                            className="text-xs text-brand-electric hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            Editar texto
                          </button>
                        )}
                      </div>

                      {editingCaptionId === photo.id ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={editingCaptionText}
                            onChange={(e) => setEditingCaptionText(e.target.value)}
                            maxLength={255}
                            rows={3}
                            className="w-full text-xs p-2.5 border border-brand-electric rounded-xl focus:ring-2 focus:ring-brand-electric/30 focus:outline-none"
                            placeholder="Escribe el texto que aparecerá bajo esta foto..."
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">
                              {editingCaptionText.length}/255 car.
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCaptionId(null);
                                  setEditingCaptionText('');
                                }}
                                className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                                disabled={isSavingCaption}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveCaption(photo.id)}
                                disabled={isSavingCaption}
                                className="px-3 py-1 text-xs bg-brand-electric hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1"
                              >
                                {isSavingCaption ? 'Guardando...' : 'Guardar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-800 font-medium leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 min-h-[44px]">
                          {photo.caption && photo.caption.trim().length > 0 ? (
                            photo.caption
                          ) : (
                            <span className="text-gray-400 italic">Sin texto asignado</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Acciones de la Tarjeta */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleActive(photo)}
                        className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {photo.is_active ? 'visibility_off' : 'visibility'}
                        </span>
                        {photo.is_active ? 'Ocultar' : 'Mostrar'}
                      </button>

                      {/* Botón Quitar Foto */}
                      <button
                        onClick={() => setDeletingPhotoId(photo.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Quitar foto del carrusel"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Quitar Foto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: IMÁGENES PRINCIPALES (HERO Y SOBRE MÍ) */}
      {activeTab === 'principales' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hero Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-blue-50 text-brand-electric">
                  <span className="material-symbols-outlined text-[20px]">web</span>
                </span>
                <h2 className="text-lg font-bold text-gray-900">Imagen Principal (Hero)</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Aparece en la cabecera principal de la página de inicio.
              </p>
              
              <div className="aspect-video w-full relative bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-200">
                {settings.hero?.imageUrl ? (
                  <img src={settings.hero.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                    Sin imagen cargada
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block w-full text-center px-4 py-2.5 border border-gray-300 shadow-xs text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                {uploadingSetting === 'hero' ? 'Subiendo nueva imagen...' : 'Cambiar Imagen Hero'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleSettingUpload(e, 'hero')}
                  disabled={!!uploadingSetting}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 text-center">Formato recomendado: Horizontal 1920x1080 o superior.</p>
            </div>
          </div>

          {/* About Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-blue-50 text-brand-electric">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </span>
                <h2 className="text-lg font-bold text-gray-900">Foto de Perfil (Sobre Mí)</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Aparece en la sección biográfica y credenciales profesionales.
              </p>

              <div className="aspect-square w-48 h-48 mx-auto relative bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
                {settings.about?.imageUrl ? (
                  <img src={settings.about.imageUrl} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block w-full text-center px-4 py-2.5 border border-gray-300 shadow-xs text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                {uploadingSetting === 'about' ? 'Subiendo nueva foto...' : 'Cambiar Foto de Perfil'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleSettingUpload(e, 'about')}
                  disabled={!!uploadingSetting}
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 text-center">Formato recomendado: Cuadrado 1:1, fondo limpio.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR FOTO AL CARRUSEL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-electric/10 text-brand-electric">
                  <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Agregar Foto al Consultorio
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewPhotoFile(null);
                  setPreviewUrl(null);
                  setNewPhotoUrl('');
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddClinicPhoto} className="space-y-5">
              {/* Opción 1: Subir Archivo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Seleccionar Foto desde tu dispositivo
                </label>
                <label className="border-2 border-dashed border-gray-300 hover:border-brand-electric rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 hover:bg-blue-50/30">
                  <span className="material-symbols-outlined text-3xl text-brand-electric mb-1">cloud_upload</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {newPhotoFile ? newPhotoFile.name : 'Haz clic para elegir una imagen (JPEG, PNG, WebP)'}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Máx. 5 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Opción 2: URL directa */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  O pegar URL directa de la imagen
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => {
                    setNewPhotoUrl(e.target.value);
                    if (!newPhotoFile) setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/foto-consultorio.jpg"
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-electric/30 focus:outline-none"
                />
              </div>

              {/* Vista previa en el modal */}
              {previewUrl && (
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Vista previa:
                  </span>
                  <div className="aspect-[4/5] max-h-[320px] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mx-auto">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Texto bajo la foto (Caption) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Texto descriptivo bajo la foto
                </label>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  maxLength={255}
                  placeholder="Ej: Área de bioimpedancia y valoración antropométrica"
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-electric/30 focus:outline-none"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Este texto aparecerá en un recuadro elegante directamente bajo la foto en el carrusel.
                </p>
              </div>

              {/* Orden de visualización */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Posición / Orden en el Carrusel
                </label>
                <input
                  type="number"
                  min={1}
                  value={newPhotoOrder}
                  onChange={(e) => setNewPhotoOrder(parseInt(e.target.value) || 1)}
                  className="w-24 text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-electric/30 focus:outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewPhotoFile(null);
                    setPreviewUrl(null);
                    setNewPhotoUrl('');
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={isUploadingPhoto}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto || (!newPhotoFile && !newPhotoUrl.trim())}
                  className="px-5 py-2.5 bg-brand-electric hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {isUploadingPhoto ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Subiendo y guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Guardar en el Carrusel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE FOTO */}
      {deletingPhotoId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              ¿Quitar foto del carrusel?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Esta foto dejará de mostrarse en la sección "Consultorio y Ubicación" de la página principal. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingPhotoId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Sí, Quitar Foto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
