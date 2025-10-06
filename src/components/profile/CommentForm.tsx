import { Button, Textarea, Label } from 'flowbite-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyLabel = Label as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnyTextarea = Textarea as any;

export function CommentForm() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-bold text-gray-800">Deja tu reseña</h3>
      <form className="flex flex-col gap-4">
        <div>
          <div className="mb-2 block">
            <AnyLabel htmlFor="comment" value="Tu comentario" />
          </div>
          <AnyTextarea id="comment" placeholder="Describe tu experiencia..." required rows={4} />
        </div>
        <Button type="submit">Enviar Reseña</Button>
      </form>
    </div>
  );
}