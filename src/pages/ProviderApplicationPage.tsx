
import { FileUpload } from '../components/form/FileUpload';

function FormField({ label, type, placeholder, id }: { readonly label: string, readonly type: string, readonly placeholder: string, readonly id: string }) {
    return (
        <div>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                id={id}
                className="w-full rounded-lg border-gray-300 bg-white p-3 text-base text-gray-900 shadow-sm transition-shadow duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                placeholder={placeholder}
                required
            />
        </div>
    );
}

function ProviderApplicationPage() {
  return (
    <div className="bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 font-poppins">
                Postula para ser Agente
            </h1>
            <p className="mt-3 text-lg text-gray-600">Únete a la red de profesionales de Chambee.</p>
        </div>

        <form className="space-y-8">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-6 font-poppins border-b pb-3">Identificación</h2>
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

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-6 font-poppins border-b pb-3">Perfil Profesional</h2>
                 <div>
                    <label htmlFor="oficio" className="block mb-2 text-sm font-medium text-gray-700">Oficio o Profesión Principal</label>
                    <input type="text" id="oficio" placeholder="Ej: Gasfitería, Electricidad Certificada" className="w-full rounded-lg border-gray-300 bg-white p-3 text-base text-gray-900 shadow-sm transition-shadow duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div className="mt-6">
                    <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-700">Cuéntanos sobre ti y tu experiencia (Bio)</label>
                    <textarea id="bio" rows={4} className="w-full rounded-lg border-gray-300 bg-white p-3 text-base text-gray-900 shadow-sm transition-shadow duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50" placeholder="Describe brevemente tus servicios, años de experiencia, etc."></textarea>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-6 font-poppins border-b pb-3">Documentación</h2>
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
                  className="w-full md:w-auto rounded-lg bg-cyan-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 transform hover:scale-105"
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