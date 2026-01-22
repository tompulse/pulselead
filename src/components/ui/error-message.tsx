import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export const ErrorMessage = ({
  title = 'Oups, une erreur est survenue',
  message,
  onRetry,
  onGoHome,
  fullScreen = false,
  className
}: ErrorMessageProps) => {
  const containerClasses = fullScreen
    ? 'min-h-screen bg-background flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Version compacte pour les erreurs inline
export const ErrorInline = ({ 
  message, 
  onRetry,
  className 
}: { 
  message: string; 
  onRetry?: () => void;
  className?: string;
}) => (
  <div className={cn('flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20', className)}>
    <div className="flex items-center gap-2 flex-1">
      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
    {onRetry && (
      <Button onClick={onRetry} size="sm" variant="ghost" className="ml-2">
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </div>
);
