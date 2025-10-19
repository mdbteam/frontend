import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

interface FormFieldProps {
  readonly label: string;
  readonly type: string;
  readonly placeholder: string;
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormField({ label, type, placeholder, id, name, value, onChange }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-200">{label}</label>
      <input
        type={type}
        id={id}
        name={name} 
        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
        placeholder={placeholder}
        value={value} 
        onChange={onChange}
        required
      />
    </div>
  );
}

type FormData = {
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  rut: string;
  correo: string;
  direccion: string;
  password: string;
};

function parseValidationError(data: ErrorResponse | undefined): string {
  if (data?.message) {
    return data.message;
  }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0].message;
  }
  return 'Datos inválidos. Revisa el formato de los campos.';
}

function getRegistrationErrorMessage(err: unknown): string {
  console.error('Error de registro:', err);

  if (!axios.isAxiosError(err)) {
    return 'Ocurrió un error inesperado.';
  }

  const { response } = err as AxiosError<ErrorResponse>;
  if (!response) {
    return 'Ocurrió un error de red o de respuesta.';
  }

  const { status, data } = response;
  switch (status) {
    case 409:
      return 'El correo o RUT ya están registrados.';
    case 400:
    case 422:
      return parseValidationError(data);
    default:
      return 'Ocurrió un error inesperado en el servidor.';
  }
}

function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    rut: '',
    correo: '',
    direccion: '',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await axios.post(`/api/auth/register`, formData);
      setSuccess('¡Registro exitoso! Serás redirigido al login.');
      setTimeout(() => navigate('/login'), 2000);
    
    } catch (err: unknown) {
      const errorMessage = getRegistrationErrorMessage(err);
      setError(errorMessage);
    }
  };

  return (
    <div className="bg-slate-900 flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white font-poppins [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
                Crear Nueva Cuenta
            </h1>
            <p className="mt-2 text-slate-400">Únete a la red Chambee. El primer paso para conectar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 border border-slate-700 p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FormField 
              label="Nombres" 
              type="text" 
              id="nombres" 
              name="nombres"
              placeholder="Tus nombres"
              value={formData.nombres}
              onChange={handleChange}
            />
            <FormField 
              label="Primer Apellido" 
              type="text" 
              id="primer_apellido" 
              name="primer_apellido"
              placeholder="Tu primer apellido"
              value={formData.primer_apellido}
              onChange={handleChange}
            />
            <FormField 
              label="Segundo Apellido" 
              type="text" 
              id="segundo_apellido" 
              name="segundo_apellido"
              placeholder="Tu segundo apellido"
              value={formData.segundo_apellido}
              onChange={handleChange}
            />
            <FormField 
              label="RUT" 
              type="text" 
              id="rut" 
              name="rut"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={handleChange}
            />
          </div>
          
          <FormField 
            label="Correo Electrónico" 
            type="email" 
            id="correo" 
            name="correo"
            placeholder="tu@correo.cl"
            value={formData.correo}
            onChange={handleChange}
          />
          <FormField 
            label="Dirección" 
            type="text" 
            id="direccion" 
            name="direccion"
            placeholder="Tu dirección completa"
            value={formData.direccion}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Contraseña" 
              type="password" 
              id="password" 
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          
            <div>
              <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-slate-200">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-base text-white focus:border-cyan-400 focus:ring-cyan-400"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="text-center text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="text-center text-green-400 text-sm">{success}</div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={!!success}
              className="w-full rounded-lg bg-cyan-500 px-8 py-3 text-lg font-bold text-white hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-colors disabled:opacity-50"
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