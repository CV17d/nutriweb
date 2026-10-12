'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type WebSettings = Record<string, any>;

export default function ImagesPage() {
  const [settings, setSettings] = useState<WebSettings>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(key);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Puedes especificar el bucket aquí si quieres: formData.append('bucket', 'images');
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Error al subir imagen');
      
      const { url } = await res.json();
      
      // Update setting with new URL
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
    } catch (error) {
      console.error(error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Imágenes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hero Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Imagen Principal (Hero)</h2>
          <div className="aspect-video w-full relative bg-gray-100 rounded-md overflow-hidden mb-4 border border-gray-200">
            {settings.hero?.imageUrl ? (
              // Usamos img normal para evitar problemas de next/image con dominios no configurados
              <img src={settings.hero.imageUrl} alt="Hero" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">Sin imagen</div>
            )}
          </div>
          <div>
            <label className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              {uploading === 'hero' ? 'Subiendo...' : 'Cambiar Imagen'}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'hero')} disabled={!!uploading} />
            </label>
            <p className="text-xs text-gray-500 mt-2 text-center">Recomendado: Formato horizontal, alta calidad.</p>
          </div>
        </div>

        {/* About Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Foto de Perfil (Sobre Mí)</h2>
          <div className="aspect-square w-48 h-48 mx-auto relative bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
            {settings.about?.imageUrl ? (
              <img src={settings.about.imageUrl} alt="About" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">Sin imagen</div>
            )}
          </div>
          <div className="mt-6">
            <label className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              {uploading === 'about' ? 'Subiendo...' : 'Cambiar Imagen'}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'about')} disabled={!!uploading} />
            </label>
            <p className="text-xs text-gray-500 mt-2 text-center">Recomendado: Formato cuadrado, donde se vea bien tu rostro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
