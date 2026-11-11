'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import type { PropertyWithMedia } from '@/types/crm';

interface PropertyMapProps {
  properties?: PropertyWithMedia[];
  singleProperty?: PropertyWithMedia;
  className?: string;
  zoom?: number;
  center?: [number, number];
}

// Fallback coordinates for key cities in Mexico
const CITY_COORDINATES: Record<string, [number, number]> = {
  querétaro: [20.5888, -100.3899],
  mérida: [20.9674, -89.5926],
  'san pedro garza garcía': [25.6575, -100.3667],
  león: [21.1221, -101.6826],
  guadalajara: [20.6597, -103.3496],
  cdmx: [19.4326, -99.1332],
};

export function PropertyMap({
  properties,
  singleProperty,
  className = 'h-96 w-full',
  zoom = 13,
  center,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load leaflet only on client
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean existing instance if re-rendering
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Determine initial center
      let initialCenter: [number, number] = center || [20.5888, -100.3899]; // Querétaro default

      if (singleProperty) {
        const cityKey = singleProperty.city.toLowerCase().trim();
        initialCenter = CITY_COORDINATES[cityKey] || [20.5888, -100.3899];
      } else if (properties && properties.length > 0) {
        const firstCityKey = properties[0].city.toLowerCase().trim();
        initialCenter = CITY_COORDINATES[firstCityKey] || [20.5888, -100.3899];
      }

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Standard free OpenStreetMap tile layer (no API key required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Emerald Marker Icon
      const createCustomIcon = (label?: string) =>
        L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background: #047857; color: white; border-radius: 9999px; padding: 6px 10px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; border: 2px solid white; transform: translate(-50%, -50%);">
              <span>📍</span>
              <span>${label || 'Ver'}</span>
            </div>
          `,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

      if (singleProperty) {
        // Single property view: draw security approximate circle
        const circle = L.circle(initialCenter, {
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.18,
          radius: 500, // 500 meters approximate perimeter
          weight: 2,
          dashArray: '6, 8',
        }).addTo(map);

        const marker = L.marker(initialCenter, {
          icon: createCustomIcon(`$${(singleProperty.price / 1000).toLocaleString('es-MX', { maximumFractionDigits: 0 })}k`),
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: #0f172a; font-size: 13px;">${singleProperty.title}</strong>
            <p style="margin: 4px 0 0 0; color: #047857; font-weight: bold;">$${singleProperty.price.toLocaleString('es-MX')} ${singleProperty.currency}</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">Zona aproximada • Cita requerida para acceso</p>
          </div>
        `);

        map.setView(initialCenter, zoom);
      } else if (properties && properties.length > 0) {
        // Multi property catalogue mode
        const bounds: [number, number][] = [];

        properties.forEach((prop, idx) => {
          const cityKey = prop.city.toLowerCase().trim();
          const baseCoords = CITY_COORDINATES[cityKey] || [20.5888, -100.3899];
          // Slight jitter so multiple properties in same city don't stack directly on top
          const jitterLat = (idx * 0.008) - 0.004;
          const jitterLng = ((idx % 2 === 0 ? 1 : -1) * 0.009) + 0.003;
          const coords: [number, number] = [baseCoords[0] + jitterLat, baseCoords[1] + jitterLng];
          bounds.push(coords);

          const cover = prop.media[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80';

          const marker = L.marker(coords, {
            icon: createCustomIcon(`$${(prop.price / 1000).toLocaleString('es-MX', { maximumFractionDigits: 0 })}k`),
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; width: 200px; padding: 2px;">
              <img src="${cover}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
              <strong style="color: #0f172a; font-size: 12px; display: block; line-height: 1.3;">${prop.title}</strong>
              <span style="color: #047857; font-weight: bold; font-size: 13px; display: block; margin-top: 3px;">$${prop.price.toLocaleString('es-MX')} ${prop.currency}</span>
              <a href="/propiedades/${prop.slug}" style="display: block; text-align: center; margin-top: 6px; padding: 5px; background: #0f172a; color: white; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 11px;">Ver Ficha Técnica</a>
            </div>
          `);
        });

        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, singleProperty, center, zoom]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Security Disclaimer Pill */}
      <div className="absolute top-3 left-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-md">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Ubicación por zona aproximada (Privacidad protegida)</span>
      </div>

      <div ref={mapContainerRef} className={className} />
    </div>
  );
}
