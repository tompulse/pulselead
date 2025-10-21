import { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const ProductTour = ({ steps, onComplete, onSkip }: ProductTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const updateTooltipPosition = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (currentStepData.position) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    setTooltipPosition({ top, left });

    // Add highlight to target element
    targetElement.classList.add('tour-highlight');
    
    // Scroll element into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      // Remove all highlights
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Remove highlight from current element
      const currentTarget = document.querySelector(steps[currentStep].target);
      currentTarget?.classList.remove('tour-highlight');
      
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const currentTarget = document.querySelector(steps[currentStep].target);
      currentTarget?.classList.remove('tour-highlight');
      
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      
      {/* Tooltip */}
      <Card
        className="fixed z-50 w-80 p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index <= currentStep 
                        ? 'w-6 bg-primary' 
                        : 'w-1.5 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStepData.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-2 -mr-2"
            onClick={onSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Passer
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                Précédent
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Terminer
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5), 0 0 0 99999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};
