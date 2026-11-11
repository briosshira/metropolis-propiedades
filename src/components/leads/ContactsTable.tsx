'use client';

import React, { useState } from 'react';
import { Contact } from '@/types/crm';
import { formatDate } from '@/styles/theme';
import { Users, Mail, Phone, Building2, Briefcase, Calendar } from 'lucide-react';

interface ContactsTableProps {
  contacts: Contact[];
}

export default function ContactsTable({ contacts }: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contacts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
        <input
          type="text"
          placeholder="Buscar contacto por nombre, correo o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="text-xs text-slate-500 font-medium">
          Total Contactos:{' '}
          <span className="font-bold text-slate-900">{contacts.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Empresa / Cargo</th>
                <th className="py-3 px-4">Notas</th>
                <th className="py-3 px-4">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron contactos en este inquilino.
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          {contact.firstName[0]}
                          {contact.lastName[0]}
                        </div>
                        <span>
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {contact.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {contact.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <div>
                        <span className="font-medium block">
                          {contact.company || '-'}
                        </span>
                        {contact.jobTitle && (
                          <span className="text-[10px] text-slate-400 block">
                            {contact.jobTitle}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {contact.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
