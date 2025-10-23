import { Brain, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QualificationStatusProps {
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

export const QualificationStatus = ({ isQualifying, results }: QualificationStatusProps) => {
  if (!isQualifying && !results) return null;
  if (results?.alreadyQualified) return null;

  const progress = results && results.total > 0 
    ? (results.processed / results.total) * 100 
    : 0;

  const topCategories = results?.categories 
    ? Object.entries(results.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    : [];

  if (isQualifying || (results && results.processed < results.total)) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Qualification IA en cours...</span>
                {results && (
                  <span className="text-xs text-muted-foreground">
                    {results.processed} / {results.total}
                  </span>
                )}
              </div>
              {results && (
                <Progress value={progress} className="h-2" />
              )}
            </div>
          </div>
          
          {results && results.processed > 0 && (
            <div className="text-xs text-muted-foreground">
              {results.succeeded} qualifiées • {results.failed} échecs
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (results && results.processed >= results.total) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                ✅ {results.succeeded.toLocaleString()} entreprises qualifiées !
              </div>
              {results.failed > 0 && (
                <div className="text-xs text-muted-foreground">
                  {results.failed} échecs
                </div>
              )}
            </div>
          </div>

          {topCategories.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Top catégories détectées:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topCategories.map(([category, count]) => (
                  <Badge 
                    key={category} 
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                  >
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
