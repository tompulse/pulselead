import { Brain, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QualificationProgressProps {
  isQualifying: boolean;
  results: {
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    categories: Record<string, number>;
    alreadyQualified?: boolean;
  } | null;
}

export const QualificationProgress = ({ isQualifying, results }: QualificationProgressProps) => {
  if (!isQualifying && !results) return null;
  if (results?.alreadyQualified) return null;

  const progress = results && results.total > 0 
    ? (results.processed / results.total) * 100 
    : 0;

  const topCategories = results?.categories 
    ? Object.entries(results.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join(', ')
    : '';

  if (isQualifying || (results && results.processed < results.total)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              <div className="flex flex-col gap-1 min-w-[120px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Qualification IA</span>
                  {results && (
                    <span className="text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
                {results && (
                  <Progress value={progress} className="h-1" />
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {results ? (
              <div className="space-y-1">
                <p className="font-medium">Analyse en cours...</p>
                <p className="text-xs text-muted-foreground">
                  {results.processed.toLocaleString()} / {results.total.toLocaleString()} entreprises
                </p>
                <p className="text-xs text-muted-foreground">
                  {results.succeeded} qualifiées • {results.failed} échecs
                </p>
              </div>
            ) : (
              <p>Initialisation de la qualification...</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (results && results.processed >= results.total) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className="gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/15"
            >
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">
                {results.succeeded.toLocaleString()} qualifiées
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5">
              <p className="font-medium">✅ Qualification terminée !</p>
              <p className="text-xs text-muted-foreground">
                {results.succeeded.toLocaleString()} entreprises analysées
              </p>
              {results.failed > 0 && (
                <p className="text-xs text-muted-foreground">
                  {results.failed} échecs
                </p>
              )}
              {topCategories && (
                <p className="text-xs text-muted-foreground mt-2">
                  Top: {topCategories}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};
