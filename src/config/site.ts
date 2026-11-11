/**
 * Configuración central de marca, contacto y parámetros comerciales
 * de Metropolis Propiedades.
 * 
 * Puedes editar aquí el número oficial de WhatsApp, nombre comercial,
 * correos de soporte y porcentajes de comisión sugeridos.
 */

export const siteConfig = {
  name: 'Metropolis Propiedades',
  shortName: 'Metropolis',
  tagline: 'Terrenos, Residencias y Rentas con Comisión Garantizada',
  description:
    'Portal inmobiliario y CRM de alta confianza. Publica tu terreno o propiedad con nosotros y gana tu comisión al cerrar la venta o renta.',
  
  // Teléfono oficial para recepción de prospectos vía WhatsApp (código de país + número, sin espacios ni símbolos)
  // Ejemplo: '52' (México) + '5512345678' = '525512345678'
  whatsapp: {
    number: '525512345678',
    defaultMessagePrefix: 'Hola, vi en el portal Metropolis Propiedades',
  },

  contact: {
    email: 'contacto@metropolispropiedades.com',
    phone: '+52 (55) 1234 5678',
    address: 'Av. Paseo de la Reforma 450, Piso 18, Ciudad de México',
  },

  // Esquema de comisiones por defecto
  commissions: {
    standardCommissionRate: 5.0, // 5% de comisión inmobiliaria total
    defaultCaptadorSharePct: 30.0, // 30% del total para quien captó o refirió el inmueble
    defaultAgentSharePct: 40.0, // 40% del total para el asesor interno que cerró la operación
  },

  // Moneda y localización
  currency: {
    default: 'MXN',
    supported: ['MXN', 'USD'],
    symbol: '$',
  },
} as const;

export type SiteConfig = typeof siteConfig;
