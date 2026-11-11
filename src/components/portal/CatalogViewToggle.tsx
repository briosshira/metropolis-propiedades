'use client';

import { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Map,
  Sparkles,
  Building2,
  Filter,
  DollarSign,
  Maximize2,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { PropertyMap } from './PropertyMap';
import type { PropertyWithMedia, PropertyType, OperationType } from '@/types/crm';
import Link from 'next/link';

interface CatalogViewToggleProps {
  properties: PropertyWithMedia[];
}

export function CatalogViewToggle({ properties }: CatalogViewToggleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | 'MXN' | 'USD'>('ALL');
  const [selectedOperation, setSelectedOperation] = useState<'ALL' | OperationType>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | PropertyType>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [landAreaPreset, setLandAreaPreset] = useState<'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HECTARE'>('ALL');

  // Filter Logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Search text
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(term);
        const matchesCity = prop.city.toLowerCase().includes(term);
        const matchesNeighborhood = prop.neighborhood?.toLowerCase().includes(term);
        const matchesAddress = prop.address?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCity && !matchesNeighborhood && !matchesAddress) {
          return false;
        }
      }

      // 2. Currency
      if (selectedCurrency !== 'ALL' && prop.currency.toUpperCase() !== selectedCurrency) {
        return false;
      }

      // 3. Operation
      if (selectedOperation !== 'ALL' && prop.operationType !== selectedOperation) {
        return false;
      }

      // 4. Type
      if (selectedType !== 'ALL' && prop.propertyType !== selectedType) {
        return false;
      }

      // 5. Price Min / Max
      if (minPrice && prop.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice && prop.price > Number(maxPrice)) {
        return false;
      }

      // 6. Land Area Presets
      const area = prop.landArea || 0;
      if (landAreaPreset === 'SMALL' && area >= 500) return false;
      if (landAreaPreset === 'MEDIUM' && (area < 500 || area > 2500)) return false;
      if (landAreaPreset === 'LARGE' && (area < 2500 || area > 10000)) return false;
      if (landAreaPreset === 'HECTARE' && area < 10000) return false; // Más de 1 Hectárea

      return true;
    });
  }, [
    properties,
    searchTerm,
    selectedCurrency,
    selectedOperation,
    selectedType,
    minPrice,
    maxPrice,
    landAreaPreset,
  ]);

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedCurrency !== 'ALL' ? 1 : 0,
    selectedOperation !== 'ALL' ? 1 : 0,
    selectedType !== 'ALL' ? 1 : 0,
    minPrice ? 1 : 0,
    maxPrice ? 1 : 0,
    landAreaPreset !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCurrency('ALL');
    setSelectedOperation('ALL');
    setSelectedType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setLandAreaPreset('ALL');
  };

  return (
    <div className="space-y-6">
      {/* View Switcher & Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Catálogo Inmobiliario & Mapa Interactivo</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            Inmuebles y Terrenos Disponibles
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              showFilters || activeFiltersCount > 0
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-700" />
            <span>Filtros Avanzados</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Grid vs Map Switcher */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Ver en Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel (collapsible or always visible when active) */}
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all space-y-4 ${
          showFilters ? 'block animate-fade-in' : 'hidden md:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Search text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Buscar por ubicación o título</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Querétaro, Los Encinos, Terreno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 2. Currency Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span>Tipo de Moneda</span>
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(['ALL', 'MXN', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`flex-1 rounded-lg py-1.5 text-center font-bold transition-all ${
                    selectedCurrency === curr
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {curr === 'ALL' ? 'Todas' : curr === 'MXN' ? '🇲🇽 MXN' : '🇺🇸 USD'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Operation Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Operación</label>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value as 'ALL' | OperationType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Todas las operaciones</option>
              <option value="VENTA">Venta</option>
              <option value="RENTA">Renta</option>
              <option value="TRASPASO">Traspaso</option>
            </select>
          </div>

          {/* 4. Property Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo de Inmueble</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'ALL' | PropertyType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="TERRENO">🌾 Terrenos / Lotes</option>
              <option value="CASA">🏡 Casas</option>
              <option value="DEPARTAMENTO">🏢 Departamentos</option>
              <option value="LOCAL_COMERCIAL">🏪 Locales Comerciales</option>
              <option value="BODEGA">🏭 Bodegas Industriales</option>
            </select>
          </div>
        </div>

        {/* Row 2: Price range & Land Area presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Price Range */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Rango de Precio ({selectedCurrency === 'USD' ? 'USD' : 'MXN'})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Precio Mínimo"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Precio Máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Land Area / Hectáreas Quick Pills */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Superficie de Terreno / Hectáreas</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Cualquiera' },
                { id: 'SMALL', label: '< 500 m²' },
                { id: 'MEDIUM', label: '500 - 2,500 m²' },
                { id: 'LARGE', label: '2,500 - 10,000 m²' },
                { id: 'HECTARE', label: '🌾 +1 Ha (+10,000 m²)' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setLandAreaPreset(pill.id as typeof landAreaPreset)}
                  className={`rounded-lg px-2.5 py-1.5 font-bold transition-all ${
                    landAreaPreset === pill.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Footer: Result counter & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-600">
            Mostrando <strong>{filteredProperties.length}</strong> de <strong>{properties.length}</strong> inmuebles
            {selectedCurrency !== 'ALL' ? ` en ${selectedCurrency}` : ''}
          </span>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpiar Filtros ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content depending on active view mode */}
      {filteredProperties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <PropertyMap properties={filteredProperties} className="h-[520px] w-full" zoom={11} />
            <p className="text-xs text-slate-500 text-center">
              Haz clic en cualquier pin verde para ver el precio, foto y abrir la ficha técnica de la propiedad.
            </p>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-900">
            No se encontraron inmuebles con estos filtros
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Intenta ampliar el rango de precio o cambiar el tamaño de superficie de terreno.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restablecer Filtros</span>
          </button>
        </div>
      )}
    </div>
  );
}
