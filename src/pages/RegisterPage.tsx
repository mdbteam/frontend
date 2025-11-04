import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import axios, { type AxiosError } from 'axios';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { validateRut, formatRut } from '../lib/utils';

const registerSchema = z.object({
  nombres: z.string().min(1, "El nombre es requerido"),
  primer_apellido: z.string().min(1, "El primer apellido es requerido"),
  segundo_apellido: z.string().optional(),
  
  rut: z.string()
    .min(1, "El RUT es requerido")
    .transform((val) => val.replace(/[^0-9kK]/g, '').toUpperCase())
    .refine(validateRut, "El RUT ingresado no es válido"),

  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  genero: z.string().min(1, "El género es requerido"),
  acceptTerms: z.literal(true, {
    message: "Debes aceptar los términos y condiciones",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface RegisterApiPayload {
  nombres: string;
  primer_apellido: string;
  segundo_apellido?: string | undefined;
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
    resolver: zodResolver(registerSchema),
    defaultValues: {
      genero: "Prefiero no decirlo",
      rut: "",
      telefono: "",
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
        setApiError('Ocurrió un error en el registro. Por favor, intenta de nuevo.');
      }
      console.error(error);
    }
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    setApiError(null);
    
    const apiData: RegisterApiPayload = {
      nombres: data.nombres,
      primer_apellido: data.primer_apellido,
      segundo_apellido: data.segundo_apellido,
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
  
  const RequiredStar = () => <span className="text-red-500">*</span>;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-6 bg-slate-800/50 border border-slate-700 rounded-lg p-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-white font-poppins [text-shadow:0_0_15px_rgba(234,179,8,0.4)]">
            Crea tu Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
              Inicia sesión
            </Link>
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="p-3 text-center text-sm text-red-300 bg-red-500/20 rounded-md border border-red-500/30">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres <RequiredStar /></Label>
              <Input id="nombres" {...register("nombres")} disabled={isLoading} className={errors.nombres ? 'border-red-500' : ''} />
              {errors.nombres && <p className="text-sm text-red-400">{errors.nombres.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="primer_apellido">Primer Apellido <RequiredStar /></Label>
              <Input id="primer_apellido" {...register("primer_apellido")} disabled={isLoading} className={errors.primer_apellido ? 'border-red-500' : ''} />
              {errors.primer_apellido && <p className="text-sm text-red-400">{errors.primer_apellido.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="segundo_apellido">Segundo Apellido (Opcional)</Label>
            <Input id="segundo_apellido" {...register("segundo_apellido")} disabled={isLoading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico <RequiredStar /></Label>
              <Input id="email" type="email" {...register("email")} disabled={isLoading} className={errors.email ? 'border-red-500' : ''} />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rut">RUT <RequiredStar /></Label>
              <Controller
                name="rut"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="rut" 
                    type="text" 
                    placeholder="12.345.678-9"
                    value={field.value}
                    onChange={(e) => {
                      const formatted = formatRut(e.target.value);
                      e.target.value = formatted;
                      field.onChange(formatted);
                    }}
                    onBlur={field.onBlur}
                    disabled={isLoading} 
                    className={errors.rut ? 'border-red-500' : ''} 
                    maxLength={12}
                  />
                )}
              />
              {errors.rut && <p className="text-sm text-red-400">{errors.rut.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="password">Contraseña <RequiredStar /></Label>
              <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} disabled={isLoading} className={errors.password ? 'border-red-500' : ''} maxLength={50} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword">Confirmar Contraseña <RequiredStar /></Label>
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} disabled={isLoading} className={errors.confirmPassword ? 'border-red-500' : ''} maxLength={50} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-slate-400" aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección <RequiredStar /></Label>
            <Input id="direccion" {...register("direccion")} disabled={isLoading} className={errors.direccion ? 'border-red-500' : ''} />
            {errors.direccion && <p className="text-sm text-red-400">{errors.direccion.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(numericValue);
                    }}
                    onBlur={field.onBlur}
                    disabled={isLoading} 
                    className={errors.telefono ? 'border-red-500' : ''} 
                    maxLength={12}
                  />
                )}
              />
              {errors.telefono && <p className="text-sm text-red-400">{errors.telefono.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento <RequiredStar /></Label>
              <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} disabled={isLoading} className={errors.fecha_nacimiento ? 'border-red-500' : ''} />
              {errors.fecha_nacimiento && <p className="text-sm text-red-400">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Género <RequiredStar /></Label>
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-4 text-slate-300">
                  {["Masculino", "Femenino", "Prefiero no decirlo"].map(g => (
                    <div key={g} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id={g} 
                        value={g} 
                        checked={field.value === g}
                        onChange={field.onChange}
                        name="genero"
                        className="h-4 w-4 text-amber-400 focus:ring-amber-300"
                        disabled={isLoading}
                        title={g}
                      />
                      <Label htmlFor={g} className="font-normal">{g}</Label>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Controller
                name="acceptTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="acceptTerms"
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    disabled={isLoading}
                    aria-invalid={!!errors.acceptTerms}
                  />
                )}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal text-slate-300">
                Acepto los <a href="#" className="text-amber-400 hover:underline">Términos y Condiciones</a> <RequiredStar />
              </Label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-400">{errors.acceptTerms.message}</p>}
          </div>

          <div>
            <Button type="submit" className="w-full bg-amber-400 text-slate-900 hover:bg-amber-400/90" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}