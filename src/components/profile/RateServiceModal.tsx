import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaStar, FaSpinner, FaCommentDots } from "react-icons/fa";

import { useAuthStore } from "../../store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

const ratingSchema = z.object({
  puntaje: z.number().min(1, "Debes seleccionar al menos 1 estrella").max(5),
  comentario: z.string().optional(),
});

type RatingFormInputs = z.infer<typeof ratingSchema>;

interface RateServiceModalProps {
  trabajoId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prestadorNombre?: string;
}

const apiProveedores = axios.create({
  baseURL: 'https://provider-service-mjuj.onrender.com' 
});

export function RateServiceModal({ trabajoId, isOpen, onClose, onSuccess, prestadorNombre }: RateServiceModalProps) {
  const { token } = useAuthStore();
  
  const [hoverRating, setHoverRating] = useState(0); 
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RatingFormInputs>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { puntaje: 0, comentario: "" }
  });

  const currentRating = watch("puntaje");

  const mutation = useMutation({
    mutationFn: async (data: RatingFormInputs) => {
      return apiProveedores.post(`/trabajos/${trabajoId}/valorar-prestador`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error al valorar:", error);
    }
  });

  const onSubmit = (data: RatingFormInputs) => {
    mutation.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    setValue("puntaje", rating, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl text-amber-400 font-bold flex justify-center items-center gap-2">
            <FaStar className="animate-pulse" /> ¡Trabajo Finalizado!
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            ¿Qué tal fue tu experiencia con <span className="text-white font-semibold">{prestadorNombre || "el prestador"}</span>?
            <br/>Tu opinión ayuda a mantener la calidad en Chambee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button" // Importante para accesibilidad y evitar submit accidental
                  aria-label={`Calificar con ${star} estrellas`} 
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                >
                  <FaStar
                    className={`text-4xl transition-colors duration-200 ${
                      star <= (hoverRating || currentRating)
                        ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                        : "text-slate-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="h-4 text-sm font-bold text-amber-200">
              {hoverRating || currentRating ? (
                 (hoverRating || currentRating) === 5 ? "¡Excelente!" :
                 (hoverRating || currentRating) === 4 ? "Muy Bueno" :
                 (hoverRating || currentRating) === 3 ? "Regular" :
                 (hoverRating || currentRating) === 2 ? "Malo" : "Pésimo"
              ) : "Selecciona una calificación"}
            </p>
            {errors.puntaje && <span className="text-red-400 text-xs">{errors.puntaje.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario" className="text-slate-300 font-bold flex items-center gap-2">
                <FaCommentDots /> Cuéntanos más (Opcional)
            </Label>
            <Textarea
              id="comentario"
              {...register("comentario")}
              placeholder="¿Fue puntual? ¿Trabajó limpio? ¿Lo recomendarías?"
              className="bg-slate-950 border-slate-700 text-white min-h-[100px] focus:border-amber-400 focus:ring-amber-400/20 placeholder:text-slate-600"
            />
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto text-slate-400 hover:text-white"
            >
              Omitir por ahora
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || currentRating === 0}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-lg shadow-amber-900/20"
            >
              {isSubmitting ? <><FaSpinner className="animate-spin mr-2" /> Enviando...</> : "Enviar Valoración"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}