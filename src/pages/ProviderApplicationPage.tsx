import React from 'react';
import { FileUpload } from '../components/form/FileUpload';

function FormField({ label, type, placeholder, id }: { readonly label: string, readonly type: string, readonly placeholder: string, readonly id: string }) {
    return (
        <div>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-200">{label}</label>
            <input
                type={type}
                id={id}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-yellow-400 focus:ring-yellow-400"
                placeholder={placeholder}
                required
            />
        </div>
    );
}

function ProviderApplicationPage() {
  return (
    <div className="bg-slate-900 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white font-poppins" style={{ textShadow: '0 0 15px rgba(234, 179, 8, 0.4)' }}>
                Terminal de Ingreso de Agente
            </h1>
            <p className="mt-2 text-slate-400">Únete a la red de profesionales de Chambee.</p>
        </div>

        <form className="space-y-8">
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-yellow-400 mb-6 font-poppins">Identificación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nombres" type="text" id="nombres" placeholder="Tus nombres" />
                    <FormField label="Primer Apellido" type="text" id="primer_apellido" placeholder="Tu primer apellido" />
                    <FormField label="Segundo Apellido" type="text" id="segundo_apellido" placeholder="Tu segundo apellido" />
                    <FormField label="RUT" type="text" id="rut" placeholder="12.345.678-9" />
                    <FormField label="Correo Electrónico" type="email" id="correo" placeholder="tu@correo.cl" />
                    <FormField label="Dirección" type="text" id="direccion" placeholder="Tu dirección completa" />
                    <FormField label="Teléfono" type="tel" id="telefono" placeholder="+56 9 1234 5678" />
                </div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-yellow-400 mb-6 font-poppins">Perfil Profesional</h2>
                 <div>
                    <label htmlFor="oficio" className="block mb-2 text-sm font-medium text-slate-200">Oficio o Profesión Principal</label>
                    <input type="text" id="oficio" placeholder="Ej: Gasfitería, Electricidad Certificada" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-yellow-400 focus:ring-yellow-400" />
                </div>
                <div className="mt-6">
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-slate-200">Cuéntanos sobre ti y tu experiencia (Bio)</label>
                    <textarea id="bio" rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-yellow-400 focus:ring-yellow-400" placeholder="Describe brevemente tus servicios, años de experiencia, etc."></textarea>
                </div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-yellow-400 mb-6 font-poppins">Documentación</h2>
                <div className="space-y-6">
                    <FileUpload
                        label="Portafolio de Trabajos"
                        helpText="Sube imágenes de tus mejores trabajos (JPG, PNG, GIF)"
                        acceptedFileTypes="image/*"
                    />
                    <FileUpload
                        label="Certificados y Documentos"
                        helpText="Cédula de identidad, certificados de estudios, etc. (PDF, JPG, PNG)"
                        acceptedFileTypes=".pdf,image/jpeg,image.png"
                    />
                </div>
            </div>
            <div className="text-center pt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto rounded-lg bg-yellow-400 px-10 py-4 text-lg font-bold text-slate-900 hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-colors"
                >
                  Enviar Postulación
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default ProviderApplicationPage;