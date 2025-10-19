import { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { FaFileUpload, FaFilePdf, FaImage, FaTrash, FaFile } from 'react-icons/fa';

interface FileUploadProps {
  readonly label: string;
  readonly helpText: string;
  readonly acceptedFileTypes: string;
  readonly files: File[];
  readonly onFilesChange: (files: File[]) => void;
}

function FileIcon({ file }: { readonly file: File }) {
  if (file.type.startsWith('image/')) {
    return <FaImage className="text-cyan-400" />;
  }
  if (file.type === 'application/pdf') {
    return <FaFilePdf className="text-red-400" />;
  }
  return <FaFile className="text-slate-400" />;
}

export function FileUpload({
  label,
  helpText,
  acceptedFileTypes,
  files,
  onFilesChange
}: FileUploadProps) {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange(acceptedFiles);
  }, [onFilesChange]);

  const removeFile = (fileName: string) => {
    const newFiles = files.filter((file) => file.name !== fileName);
    onFilesChange(newFiles);
  };

  const accept: Accept = acceptedFileTypes
    .split(',')
    .reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Accept);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
  });

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-slate-300">{label}</label>
      <div
        {...getRootProps()}
        className={`flex justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-slate-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-cyan-400 focus:outline-none ${
          isDragActive ? 'border-cyan-400 bg-slate-800' : ''
        }`}
      >
        <span className="flex items-center space-x-2">
          <FaFileUpload className={`h-6 w-6 ${isDragActive ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span className="font-medium text-slate-400">
            {isDragActive
              ? 'Suelta los archivos aquí...'
              : 'Arrastra tus archivos o haz clic para seleccionar'}
          </span>
        </span>
        <input {...getInputProps()} />
      </div>
      <p className="text-xs text-slate-500 mt-1">{helpText}</p>
      
      <div className="mt-4 space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-2 pl-3 bg-slate-800 border border-slate-700 rounded-md"
          >
            <div className="flex items-center space-x-2">
              <FileIcon file={file} />
              <span className="text-sm text-slate-200">{file.name}</span>
            </div>
            
            {/* --- CORRECCIÓN APLICADA AQUÍ --- */}
            <button
              type="button"
              onClick={() => removeFile(file.name)}
              className="p-1 text-red-500 rounded-md hover:bg-red-900/50"
              aria-label={`Eliminar archivo ${file.name}`} 
            >
              <FaTrash />
            </button>
            {/* ---------------------------------- */}

          </div>
        ))}
      </div>
    </div>
  );
}