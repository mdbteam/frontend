import { useState } from 'react';
import { useForm, type SubmitHandler, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import axios, { type AxiosError } from 'axios';
import { FaEye, FaEyeSlash, FaUserShield, FaIdCard } from 'react-icons/fa';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { validateRut, formatRut } from '../lib/utils';

// --- VALIDACIONES ---

const isAdult = (dateString: string) => {
  if (!dateString) return false;
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
};

const registerSchema = z.object({
  nombres: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "Solo letras"),
  primer_apellido: z.string().min(2, "Mínimo 2 caracteres").regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, "Solo letras"),
  segundo_apellido: z.string().optional().refine((val) => !val || /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(val), "Solo letras"),
  
  rut: z.string()
    .min(1, "El RUT es requerido")
    .transform((val) => val.replace(/[^0-9kK]/g, '').toUpperCase())
    .refine(validateRut, "El RUT ingresado no es válido"),

  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
  direccion: z.string().min(5, "Dirección muy corta"),
  telefono: z.string().regex(/^\d{9}$/, "Debe tener 9 dígitos numéricos"),
  
  fecha_nacimiento: z.string().min(1, "Fecha requerida").refine(isAdult, "Debes ser mayor de 18 años"),
  genero: z.string().min(1, "Selecciona un género"),
  
  // 🔴 CORRECCIÓN ZOD: Usamos .boolean().refine() en lugar de .literal() con errorMap
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface RegisterApiPayload {
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string;
  rut: string;
  correo: string;
  password: string;
  direccion: string;
  telefono: string;
  fecha_de_nacimiento: string;
  genero: string;
}

const registerUser = async (data: RegisterApiPayload) => {
  const { data: responseData } = await axios.post('/api/auth/register', data);
  return responseData;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema) as unknown as Resolver<RegisterFormInputs>,
    defaultValues: {
      genero: "Prefiero no decirlo",
      rut: "",
      telefono: "",
      acceptTerms: false, // Inicializar en false
    }
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate('/login?registration=success');
    },
    onError: (error: AxiosError) => {
      if (error.response && (error.response.status === 400 || error.response.status === 409)) {
        setApiError('El correo electrónico o RUT ya está registrado.');
      } else {
        setApiError('Ocurrió un error en el registro. Verifica tus datos.');
      }
    }
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    setApiError(null);
    const apiData: RegisterApiPayload = {
      nombres: data.nombres,
      primer_apellido: data.primer_apellido,
      segundo_apellido: data.segundo_apellido || undefined,
      rut: data.rut,
      correo: data.email,
      password: data.password,
      direccion: data.direccion,
      telefono: data.telefono,
      fecha_de_nacimiento: data.fecha_nacimiento,
      genero: data.genero,
    };
    mutation.mutate(apiData);
  };

  const isLoading = isSubmitting || mutation.isPending;
  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950">
      <div className="w-full max-w-3xl space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center border-b border-slate-800 pb-6">
          <h2 className="text-3xl font-bold text-white font-poppins bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Únete a Chambee
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="p-4 text-center text-sm text-red-200 bg-red-900/30 rounded-lg border border-red-800 animate-pulse">
              {apiError}
            </div>
          )}

          {/* DATOS DE CUENTA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <FaUserShield className="text-cyan-500" /> Datos de la Cuenta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico <RequiredStar /></Label>
                <Input id="email" type="email" {...register("email")} disabled={isLoading} className={errors.email ? 'border-red-500 bg-red-900/10' : 'bg-slate-800'} placeholder="nombre@ejemplo.com" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="rut">RUT <RequiredStar /></Label>
                <Controller
                  name="rut"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="rut" 
                      placeholder="12.345.678-9"
                      value={field.value}
                      onChange={(e) => {
                        const formatted = formatRut(e.target.value);
                        field.onChange(formatted);
                      }}
                      onBlur={field.onBlur}
                      disabled={isLoading} 
                      className={errors.rut ? 'border-red-500 bg-red-900/10' : 'bg-slate-800'} 
                      maxLength={12}
                    />
                  )}
                />
                {errors.rut && <p className="text-xs text-red-400 mt-1">{errors.rut.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1 relative">
                <Label htmlFor="password">Contraseña <RequiredStar /></Label>
                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} disabled={isLoading} className={errors.password ? 'border-red-500 bg-red-900/10' : 'bg-slate-800'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-white" title={showPassword ? "Ocultar" : "Mostrar"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-1 relative">
                <Label htmlFor="confirmPassword">Confirmar Contraseña <RequiredStar /></Label>
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} disabled={isLoading} className={errors.confirmPassword ? 'border-red-500 bg-red-900/10' : 'bg-slate-800'} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-white" title={showConfirmPassword ? "Ocultar" : "Mostrar"}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* INFORMACIÓN PERSONAL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <FaIdCard className="text-amber-500" /> Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label htmlFor="nombres">Nombres <RequiredStar /></Label>
                <Input id="nombres" {...register("nombres")} disabled={isLoading} className={errors.nombres ? 'border-red-500' : 'bg-slate-800'} />
                {errors.nombres && <p className="text-xs text-red-400 mt-1">{errors.nombres.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="primer_apellido">Primer Apellido <RequiredStar /></Label>
                <Input id="primer_apellido" {...register("primer_apellido")} disabled={isLoading} className={errors.primer_apellido ? 'border-red-500' : 'bg-slate-800'} />
                {errors.primer_apellido && <p className="text-xs text-red-400 mt-1">{errors.primer_apellido.message}</p>}
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
              <Input id="segundo_apellido" {...register("segundo_apellido")} disabled={isLoading} className="bg-slate-800" />
              {errors.segundo_apellido && <p className="text-xs text-red-400 mt-1">{errors.segundo_apellido.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Label htmlFor="telefono">Teléfono <RequiredStar /></Label>
                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      id="telefono" 
                      type="tel" 
                      placeholder="912345678"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={field.onBlur}
                      disabled={isLoading} 
                      className={errors.telefono ? 'border-red-500' : 'bg-slate-800'} 
                      maxLength={9}
                    />
                  )}
                />
                {errors.telefono && <p className="text-xs text-red-400 mt-1">{errors.telefono.message}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento <RequiredStar /></Label>
                <Input 
                    id="fecha_nacimiento" 
                    type="date" 
                    max={maxDateString}
                    {...register("fecha_nacimiento")} 
                    disabled={isLoading} 
                    className={errors.fecha_nacimiento ? 'border-red-500' : 'bg-slate-800'} 
                />
                {errors.fecha_nacimiento && <p className="text-xs text-red-400 mt-1">{errors.fecha_nacimiento.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="direccion">Dirección <RequiredStar /></Label>
              <Input id="direccion" {...register("direccion")} disabled={isLoading} className={errors.direccion ? 'border-red-500' : 'bg-slate-800'} />
              {errors.direccion && <p className="text-xs text-red-400 mt-1">{errors.direccion.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Género <RequiredStar /></Label>
              <Controller
                name="genero"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-6 pt-1">
                    {["Masculino", "Femenino", "Prefiero no decirlo"].map(g => (
                      <div key={g} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          id={g} 
                          value={g} 
                          checked={field.value === g}
                          onChange={field.onChange} 
                          name="genero"
                          className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                          disabled={isLoading}
                          title={`Seleccionar género ${g}`} // 🔴 CORRECCIÓN ACCESIBILIDAD
                        />
                        <Label htmlFor={g} className="font-normal text-slate-300 cursor-pointer">{g}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* CHECKBOX Y BOTÓN */}
          <div className="space-y-4">
            
            {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms.message}</p>}

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 text-lg shadow-lg shadow-cyan-900/20" disabled={isLoading}>
              {isLoading ? 'Creando tu cuenta...' : 'Registrarme'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}