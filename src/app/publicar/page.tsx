'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/portal/Navbar';
import { submitPropertyForReviewAction } from '@/actions/properties';
import { FileUpload, type UploadedFileItem } from '@/components/ui/FileUpload';
import {
  Sparkles,
  DollarSign,
  Calculator,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function PublicarPropiedadPage() {
  // Form State
  const [operationType, setOperationType] = useState<'VENTA' | 'RENTA'>('VENTA');
  const [propertyType, setPropertyType] = useState<'TERRENO' | 'CASA' | 'DEPARTAMENTO' | 'LOCAL_COMERCIAL' | 'BODEGA'>('TERRENO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1200000);
  const [currency, setCurrency] = useState('MXN');
  const [city, setCity] = useState('Querétaro');
  const [state, setState] = useState('Querétaro');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [landArea, setLandArea] = useState<number | ''>(500);
  const [constructionArea, setConstructionArea] = useState<number | ''>('');
  const [bedrooms, setBedrooms] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(0);
  const [parkingSpaces, setParkingSpaces] = useState<number>(0);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'Servicios a pie de lote',
    'Escrituración inmediata',
    'Acceso pavimentado',
  ]);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
  );
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [virtualTourUrl, setVirtualTourUrl] = useState('');
  const [floorPlanUrl, setFloorPlanUrl] = useState('');

  // Affiliate Calculator
  const commissionRate = 5.0; // 5% de comisión estándar
  const captadorSharePct = 30.0; // 30% del total para el captador
  const totalCommission = (price * commissionRate) / 100;
  const captadorEarn = (totalCommission * captadorSharePct) / 100;

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (item: string) => {
    setFeatures(features.filter((f) => f !== item));
  };

  const handleAddImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      title,
      description,
      propertyType,
      operationType,
      price: Number(price),
      currency,
      city,
      state,
      neighborhood: neighborhood || undefined,
      address: address || undefined,
      landArea: landArea ? Number(landArea) : undefined,
      constructionArea: constructionArea ? Number(constructionArea) : undefined,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      features,
      images,
      virtualTourUrl: virtualTourUrl.trim() || undefined,
      floorPlans: floorPlanUrl.trim()
        ? [
            {
              id: 'fp-uploaded-1',
              title: 'Plano Arquitectónico General',
              url: floorPlanUrl.trim(),
              level: 'Distribución y cotas',
            },
          ]
        : undefined,
      commissionRate,
      captadorCommissionPct: captadorSharePct,
    };

    const res = await submitPropertyForReviewAction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSubmittedProperty(res.data);
    } else {
      setErrorMessage(res.error || 'Ocurrió un error al registrar el inmueble.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Publica y Gana Comisión</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Registra tu Terreno o Inmueble
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sube los datos de tu propiedad. Un gestor comercial la revisará para publicarla en el portal y tú recibirás tu comisión al cerrarse la venta o renta.
          </p>
        </div>

        {/* Live Commission Calculator Card */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>Simulador de Comisión Estimada</span>
              </div>
              <h3 className="text-xl font-bold">
                Por este inmueble ganarías aproximadamente:
              </h3>
              <p className="text-xs text-slate-300 max-w-md">
                Calculado con una comisión total del {commissionRate}% y un reparto del {captadorSharePct}% para ti como captador.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md text-center min-w-[260px] border border-white/10">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Tu Comisión Ganada
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white mt-1 block">
                ${captadorEarn.toLocaleString('es-MX', { maximumFractionDigits: 0 })} {currency}
              </span>
              <span className="text-[11px] text-slate-300 block mt-1">
                Garantizada bajo contrato al firmar en notaría
              </span>
            </div>
          </div>
        </div>

        {/* Success Screen */}
        {submittedProperty ? (
          <div className="mt-10 rounded-3xl bg-white p-8 sm:p-12 text-center shadow-lg border border-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              ¡Propiedad Registrada con Éxito!
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
              Hemos registrado <strong>{submittedProperty.title}</strong> en nuestro CRM con folio <strong>{submittedProperty.id.slice(0, 8)}</strong>.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 border border-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Estado actual: En revisión por un asesor de ventas (Moderación previa)</span>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
              >
                Volver al Inicio
              </Link>
              <Link
                href="/leads"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Ver en CRM
              </Link>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="mt-10 space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Operation & Property Type */}
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Tipo de Operación e Inmueble</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(['TERRENO', 'CASA', 'DEPARTAMENTO', 'LOCAL_COMERCIAL', 'BODEGA'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`rounded-2xl border p-4 text-center transition-all ${
                      propertyType === type
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-600/30 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="mx-auto h-5 w-5 mb-1.5 text-slate-500" />
                    <span className="text-xs block capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="operationType"
                    checked={operationType === 'VENTA'}
                    onChange={() => setOperationType('VENTA')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>En Venta</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="operationType"
                    checked={operationType === 'RENTA'}
                    onChange={() => setOperationType('RENTA')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>En Renta</span>
                </label>
              </div>
            </div>

            {/* Step 2: Basic Info & Price */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">2. Información General y Precio</h2>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700">Título de la publicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Terreno Campestre Plano con Vista a las Montañas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Precio del Inmueble *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-3 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="MXN">MXN (Pesos Mexicanos)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Descripción detallada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe las ventajas del terreno o inmueble, servicios disponibles, escrituración, facilidades de pago, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">3. Ubicación del Inmueble</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Estado / Región *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Colonia o Fraccionamiento</label>
                  <input
                    type="text"
                    placeholder="Ej. Juriquilla / Los Encinos"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Dirección o Referencia</label>
                  <input
                    type="text"
                    placeholder="Calle, número o lote"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Dimensions & Spaces */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">4. Dimensiones y Espacios</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Área de Terreno (m²)</label>
                  <input
                    type="number"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Construcción (m²)</label>
                  <input
                    type="number"
                    value={constructionArea}
                    onChange={(e) => setConstructionArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Recámaras</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Baños</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Features & Photos */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">5. Amenidades y Fotografías</h2>

              {/* Amenidades */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Agregar Amenidades / Características</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. Seguridad 24/7, Alberca, Vista panorámica..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Agregar
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {features.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(item)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fotos con Carga Real a Supabase Storage */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Fotografías del Inmueble (Alta Resolución)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Sube las fotos reales de tu propiedad directamente a nuestro servidor de almacenamiento seguro o añade URLs.
                  </p>
                </div>

                <FileUpload
                  bucket="properties-media"
                  folder="properties"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  maxFiles={12}
                  maxSizeMB={10}
                  title="Arrastra o selecciona las fotos de tu propiedad"
                  subtitle="Sube hasta 12 imágenes (JPG, PNG, WebP de hasta 10MB c/u)"
                  onUploadSuccess={(uploaded) => {
                    const newUrls = uploaded.map((u) => u.url);
                    setImages((prev) => Array.from(new Set([...prev, ...newUrls])));
                  }}
                />

                {/* Alternativa: Añadir URL externa */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500">¿Tienes un enlace directo a una imagen?</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shrink-0"
                    >
                      Añadir URL
                    </button>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      Fotos listas para publicar ({images.length}):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {images.map((url, i) => (
                        <div key={i} className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border shadow-sm group">
                          <img src={url} alt={`foto ${i}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                            className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 transition-colors"
                            title="Eliminar foto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              Portada Principal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multimedia Avanzada: Tour 360 y Planos */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Multimedia Inmersiva (Opcional)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Enlace de Recorrido Virtual 360° (Matterport, Kuula, YouTube 360)
                    </label>
                    <input
                      type="url"
                      placeholder="https://my.matterport.com/show/?m=..."
                      value={virtualTourUrl}
                      onChange={(e) => setVirtualTourUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Permite a los prospectos recorrer la propiedad de forma inmersiva desde su celular o computadora.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Enlace a Plano Arquitectónico o Deslinde Topográfico
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../plano-arquitectonico.jpg"
                      value={floorPlanUrl}
                      onChange={(e) => setFloorPlanUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Habilita el visor interactivo de planos con zoom y cotas de distribución.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-95"
              >
                <span>{isSubmitting ? 'Registrando en CRM...' : 'Enviar Propiedad para Revisión y Publicación'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Al enviar, aceptas nuestro contrato de mediación mercantil para el pago garantizado de tu comisión.
              </p>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
