import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'; 

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'success' | 'error' | 'info';
}

export function InfoDialog({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  type = 'info' 
}: Readonly<InfoDialogProps>) {
  
  const titleColors: Record<string, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-cyan-400',
  };
  
  const buttonClasses: Record<string, string> = {
    success: 'bg-green-600 hover:bg-green-500 text-white',
    error: 'bg-red-600 hover:bg-red-500 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900',
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className={titleColors[type]}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose} 
            className={buttonClasses[type]}
          >
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}