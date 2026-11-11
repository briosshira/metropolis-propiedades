'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Building, DollarSign, Filter } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'TODOS' | 'TERRENO' | 'CASA' | 'RENTA'>(
    (searchParams.get('tab') as any) || 'TODOS'
  );
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [operationType, setOperationType] = useState(searchParams.get('operacion') || 'VENTA');
  const [propertyType, setPropertyType] = useState(searchParams.get('tipo') || '');
  const [city, setCity] = useState(searchParams.get('ciudad') || '');

  const handleTabChange = (tab: 'TODOS' | 'TERRENO' | 'CASA' | 'RENTA') => {
    setActiveTab(tab);
    if (tab === 'TERRENO') {
      setPropertyType('TERRENO');
      setOperationType('VENTA');
    } else if (tab === 'CASA') {
      setPropertyType('CASA');
      setOperationType('VENTA');
    } else if (tab === 'RENTA') {
      setOperationType('RENTA');
      setPropertyType('');
    } else {
      setPropertyType('');
      setOperationType('');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (operationType) params.set('operacion', operationType);
    if (propertyType) params.set('tipo', propertyType);
    if (city.trim()) params.set('ciudad', city.trim());

    router.push(`/?${params.toString()}#catalogo`);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white px-4 sm:px-6 lg:px-8 -mt-2">
      <div className="mx-auto max-w-5xl text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
          <span>El portal inmobiliario donde todos ganan comisión</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
          Terrenos y propiedades en venta o renta, con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
            trato seguro y transparente
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Explora lotes residenciales, macroterrenos comerciales y residencias. Si conoces a alguien que venda, publícala con nosotros y cobra tu comisión.
        </p>

        {/* Search Box Card */}
        <div className="mt-8 mx-auto max-w-4xl rounded-2xl bg-white p-3 sm:p-4 text-slate-900 shadow-2xl shadow-black/40">
          {/* Quick Filter Tabs */}
          <div className="flex border-b border-slate-200 pb-3 gap-2 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('TODOS')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                activeTab === 'TODOS'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos los Inmuebles
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('TERRENO')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                activeTab === 'TERRENO'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🌿 Terrenos en Venta
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('CASA')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                activeTab === 'CASA'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🏡 Casas y Residencias
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('RENTA')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                activeTab === 'RENTA'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔑 En Renta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
            {/* Search query */}
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Fracc., colonia o zona..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* City */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">Todas las ciudades</option>
                <option value="Querétaro">Querétaro</option>
                <option value="Mérida">Mérida</option>
                <option value="San Pedro Garza García">Monterrey / San Pedro</option>
                <option value="León">León</option>
                <option value="Guadalajara">Guadalajara</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">Cualquier tipo</option>
                <option value="TERRENO">Terreno / Lote</option>
                <option value="CASA">Casa</option>
                <option value="DEPARTAMENTO">Departamento</option>
                <option value="LOCAL_COMERCIAL">Local Comercial</option>
                <option value="BODEGA">Bodega / Nave</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-colors active:scale-95"
            >
              <Search className="h-4 w-4" />
              <span>Buscar Inmuebles</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
