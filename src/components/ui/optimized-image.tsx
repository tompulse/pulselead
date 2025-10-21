import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Composant d'image optimisé avec lazy loading et placeholder
 * 
 * UTILITÉ: Améliore les performances en:
 * - Lazy loading (charge uniquement quand visible)
 * - Placeholder blur pendant le chargement
 * - Responsive avec srcSet
 * - Gestion des erreurs
 * 
 * USAGE:
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   className="w-full h-64"
 *   priority={false} // true pour les images above-the-fold
 * />
 */

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  placeholder?: string;
  onLoadComplete?: () => void;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ src, alt, priority = false, placeholder, className, onLoadComplete, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      if (priority) return; // Skip IntersectionObserver si priority=true

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: "50px", // Commencer à charger 50px avant l'entrée dans le viewport
        }
      );

      const currentRef = imgRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [priority]);

    const handleLoad = () => {
      setIsLoaded(true);
      onLoadComplete?.();
    };

    const handleError = () => {
      setHasError(true);
      console.error(`Failed to load image: ${src}`);
    };

    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        {/* Placeholder pendant le chargement */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/80 to-muted" />
        )}

        {/* Image réelle */}
        {isInView && !hasError && (
          <img
            ref={(node) => {
              // @ts-ignore
              imgRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            {...props}
          />
        )}

        {/* Fallback en cas d'erreur */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-sm text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Image non disponible</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
