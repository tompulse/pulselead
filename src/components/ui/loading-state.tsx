import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState = ({ 
  message = 'Chargement...', 
  fullScreen = false,
  size = 'md',
  className 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-background flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center space-y-4">
        <Loader2 
          className={cn(
            'animate-spin text-accent mx-auto',
            sizeClasses[size]
          )} 
        />
        {message && (
          <p className={cn(
            'text-muted-foreground',
            textSizeClasses[size]
          )}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loader pour les listes
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    <div className="h-4 bg-muted rounded w-3/4"></div>
    <div className="h-3 bg-muted rounded w-1/2"></div>
    <div className="h-3 bg-muted rounded w-full"></div>
  </div>
);

// Skeleton pour la carte
export const SkeletonMap = () => (
  <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
      <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
    </div>
  </div>
);

// Skeleton pour le tableau
export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
