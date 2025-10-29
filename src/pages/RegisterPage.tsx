import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { normalizeRut, isValidRutFormat } from "../utils/rut";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const registerSchema = z
  .object({
    nombres: z.string().min(1, "Requerido"),
    primer_apellido: z.string().min(1, "Requerido"),
    segundo_apellido: z.string().min(1, "Requerido"),
    rut: z
      .string()
      .min(2, "RUT requerido")
      .refine((v) => isValidRutFormat(normalizeRut(v)), {
        message: "RUT inválido",
      }),
    correo: z.string().email("Correo inválido"),
    direccion: z.string().min(1, "Requerido"),
    fecha_de_nacimiento: z.string().min(1, "Requerido"),
    genero: z.string().min(1, "Requerido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    const rutNormalizado = normalizeRut(data.rut);

    console.log("Enviando:", {
      ...data,
      rut: rutNormalizado,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900 text-slate-200">
      <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-8 border border-slate-700 shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Crear Cuenta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 🔹 DATOS PERSONALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <div>
              <label className="block mb-1">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input {...register("nombres")} className="input-base w-full" />
              {errors.nombres && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.nombres.message}
                </p>
              )}
            </div>

            {/* Primer Apellido */}
            <div>
              <label className="block mb-1">
                Primer Apellido <span className="text-red-500">*</span>
              </label>
              <input
                {...register("primer_apellido")}
                className="input-base w-full"
              />
              {errors.primer_apellido && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.primer_apellido.message}
                </p>
              )}
            </div>

            {/* Segundo Apellido */}
            <div>
              <label className="block mb-1">
                Segundo Apellido <span className="text-red-500">*</span>
              </label>
              <input
                {...register("segundo_apellido")}
                className="input-base w-full"
              />
              {errors.segundo_apellido && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.segundo_apellido.message}
                </p>
              )}
            </div>

            {/* RUT */}
            <div>
              <label className="block mb-1">
                RUT <span className="text-red-500">*</span>
              </label>
              <input
                {...register("rut")}
                className="input-base w-full"
                onBlur={(e) => setValue("rut", normalizeRut(e.target.value))}
              />
              {errors.rut && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.rut.message}
                </p>
              )}
            </div>
          </div>

          {/* 🔹 CORREO */}
          <div>
            <label className="block mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input {...register("correo")} className="input-base w-full" />
            {errors.correo && (
              <p className="text-red-400 text-sm mt-1">
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* 🔹 DIRECCIÓN */}
          <div>
            <label className="block mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input {...register("direccion")} className="input-base w-full" />
            {errors.direccion && (
              <p className="text-red-400 text-sm mt-1">
                {errors.direccion.message}
              </p>
            )}
          </div>

          {/* 🔹 NACIMIENTO + GENERO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha Nacimiento */}
            <div>
              <label className="block mb-1">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("fecha_de_nacimiento")}
                className="input-base w-full"
              />
              {errors.fecha_de_nacimiento && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.fecha_de_nacimiento.message}
                </p>
              )}
            </div>

            {/* Genero */}
            <div>
              <label className="block mb-1">
                Género <span className="text-red-500">*</span>
              </label>
              <select {...register("genero")} className="input-base w-full">
                <option value="">Seleccionar</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.genero.message}
                </p>
              )}
            </div>
          </div>

          {/* 🔹 PASSWORD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="input-base w-full pr-10"
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="input-base w-full"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Registrando..." : "Registrar Cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
