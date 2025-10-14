// src/components/FileUpload.tsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  readonly label: string;
  readonly helpText: string;
  readonly acceptedFileTypes: string; 
}

export function FileUpload({ label, helpText, acceptedFileTypes }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [acceptedFileTypes]: [] },
  });

  // Usamos 'file.name' como key, ya que es un identificador más estable que el índice.
  const filePreviews = files.map((file) => (
    <div key={file.name} className="text-xs text-slate-400 truncate">
      - {file.name} ({Math.round(file.size / 1024)} KB)
    </div>
  ));

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-slate-200">{label}</label>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-yellow-400 bg-slate-800' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
          <p className="mb-2 text-sm text-slate-400">
            <span className="font-semibold text-yellow-400">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs text-slate-500">{helpText}</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-slate-300">Archivos seleccionados:</h4>
          {filePreviews}
        </div>
      )}
    </div>
  );
}