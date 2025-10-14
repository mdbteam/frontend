
import { Link } from 'react-router-dom';

// Componente reutilizable para los campos del formulario
function FormField({ label, type, placeholder, id }: { readonly label: string, readonly type: string, readonly placeholder: string, readonly id: string }) {
    return (
        <div>
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-200">{label}</label>
            <input
                type={type}
                id={id}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
                placeholder={placeholder}
                required
            />
        </div>
    );
}

function RegisterPage() {
  return (
    <div className="bg-slate-900 flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white font-poppins" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.4)' }}>
                Crear Nueva Cuenta
            </h1>
            <p className="mt-2 text-slate-400">Únete a la red Chambee. El primer paso para conectar.</p>
        </div>

        <form className="space-y-6 bg-slate-800/50 border border-slate-700 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Nombres" type="text" id="nombres" placeholder="Tus nombres" />
                <FormField label="Primer Apellido" type="text" id="primer_apellido" placeholder="Tu primer apellido" />
                <FormField label="Segundo Apellido" type="text" id="segundo_apellido" placeholder="Tu segundo apellido" />
                <FormField label="RUT" type="text" id="rut" placeholder="12.345.678-9" />
            </div>
            
            <FormField label="Correo Electrónico" type="email" id="correo" placeholder="tu@correo.cl" />
            <FormField label="Dirección" type="text" id="direccion" placeholder="Tu dirección completa" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Contraseña" type="password" id="password" placeholder="••••••••" />
                <FormField label="Confirmar Contraseña" type="password" id="confirm_password" placeholder="••••••••" />
            </div>
            
            <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-cyan-500 px-8 py-3 text-lg font-bold text-white hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-colors"
                >
                  Registrar Cuenta
                </button>
            </div>

            <p className="text-center text-sm text-slate-400 pt-4">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-cyan-400 hover:underline">
                    Inicia Sesión
                </Link>
            </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;