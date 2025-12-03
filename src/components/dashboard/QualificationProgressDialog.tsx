import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QualificationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
  qualified?: number;
  total?: number;
  details?: string;
}

interface QualificationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QualificationProgressDialog = ({ open, onOpenChange }: QualificationProgressDialogProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<QualificationStep[]>([
    { id: 'naf', label: 'Catégories NAF (activités)', status: 'pending' },
    { id: 'departments', label: 'Départements (code postal)', status: 'pending' },
    { id: 'sizes', label: 'Tailles entreprises', status: 'pending' },
    { id: 'legal', label: 'Formes juridiques', status: 'pending' },
  ]);

  const updateStep = (id: string, updates: Partial<QualificationStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const analyzeNafCategories = async () => {
    updateStep('naf', { status: 'running' });
    
    // Total count
    const { count: totalCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true });
    
    // Count with categorie_detaillee filled
    const { count: qualifiedCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true })
      .not('categorie_detaillee', 'is', null);
    
    // Count with code_naf filled
    const { count: withNafCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true })
      .not('code_naf', 'is', null);
    
    updateStep('naf', { 
      status: 'completed', 
      qualified: qualifiedCount || 0, 
      total: totalCount || 0,
      details: `${withNafCount || 0} avec code NAF`
    });
  };

  const analyzeDepartments = async () => {
    updateStep('departments', { status: 'running' });
    
    const { count: totalCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true });
    
    // Count with valid postal code (not null and not [ND])
    const { count: qualifiedCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true })
      .not('code_postal', 'is', null)
      .neq('code_postal', '[ND]');
    
    // Count unique departments
    const { data: deptData } = await supabase
      .from('nouveaux_sites')
      .select('code_postal')
      .not('code_postal', 'is', null)
      .neq('code_postal', '[ND]')
      .limit(50000);
    
    const uniqueDepts = new Set(
      deptData?.map(d => d.code_postal?.substring(0, 2)).filter(Boolean) || []
    );
    
    updateStep('departments', { 
      status: 'completed', 
      qualified: qualifiedCount || 0, 
      total: totalCount || 0,
      details: `${uniqueDepts.size} départements différents`
    });
  };

  const analyzeCompanySizes = async () => {
    updateStep('sizes', { status: 'running' });
    
    const { count: totalCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true });
    
    // Count with categorie_entreprise filled
    const { count: qualifiedCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true })
      .not('categorie_entreprise', 'is', null);
    
    // Get distribution
    const { data: sizeData } = await supabase
      .from('nouveaux_sites')
      .select('categorie_entreprise')
      .not('categorie_entreprise', 'is', null)
      .limit(50000);
    
    const sizeCounts: Record<string, number> = {};
    sizeData?.forEach(d => {
      if (d.categorie_entreprise) {
        sizeCounts[d.categorie_entreprise] = (sizeCounts[d.categorie_entreprise] || 0) + 1;
      }
    });
    
    const topSizes = Object.entries(sizeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k)
      .join(', ');
    
    updateStep('sizes', { 
      status: 'completed', 
      qualified: qualifiedCount || 0, 
      total: totalCount || 0,
      details: topSizes ? `Top: ${topSizes}` : 'Aucune donnée'
    });
  };

  const analyzeLegalForms = async () => {
    updateStep('legal', { status: 'running' });
    
    const { count: totalCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true });
    
    // Count with categorie_juridique filled
    const { count: qualifiedCount } = await supabase
      .from('nouveaux_sites')
      .select('*', { count: 'exact', head: true })
      .not('categorie_juridique', 'is', null);
    
    // Count unique legal forms
    const { data: legalData } = await supabase
      .from('nouveaux_sites')
      .select('categorie_juridique')
      .not('categorie_juridique', 'is', null)
      .limit(50000);
    
    const uniqueForms = new Set(
      legalData?.map(d => d.categorie_juridique).filter(Boolean) || []
    );
    
    updateStep('legal', { 
      status: 'completed', 
      qualified: qualifiedCount || 0, 
      total: totalCount || 0,
      details: `${uniqueForms.size} formes juridiques différentes`
    });
  };

  const startAnalysis = async () => {
    setIsRunning(true);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', qualified: undefined, total: undefined, details: undefined })));
    
    try {
      await analyzeNafCategories();
      await analyzeDepartments();
      await analyzeCompanySizes();
      await analyzeLegalForms();
      
      toast({
        title: "✅ Analyse terminée",
        description: "L'état de qualification des données a été analysé",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite pendant l'analyse",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: QualificationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCompletionPercentage = (step: QualificationStep) => {
    if (step.total === undefined || step.qualified === undefined) return 0;
    if (step.total === 0) return 100;
    return Math.round((step.qualified / step.total) * 100);
  };

  const overallProgress = () => {
    const completed = steps.filter(s => s.status === 'completed').length;
    return (completed / steps.length) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-accent" />
            Analyse de la qualification des données
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression de l'analyse</span>
              <span className="font-medium">{Math.round(overallProgress())}%</span>
            </div>
            <Progress value={overallProgress()} className="h-2" />
          </div>
          
          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{step.label}</div>
                    {step.status === 'completed' && step.qualified !== undefined && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {step.qualified.toLocaleString()} / {step.total?.toLocaleString() || '?'} qualifiés
                          </span>
                          <span className={`font-medium ${getCompletionPercentage(step) >= 80 ? 'text-green-500' : getCompletionPercentage(step) >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {getCompletionPercentage(step)}%
                          </span>
                        </div>
                        <Progress value={getCompletionPercentage(step)} className="h-1.5" />
                        {step.details && (
                          <div className="text-xs text-muted-foreground mt-1">{step.details}</div>
                        )}
                      </div>
                    )}
                    {step.status === 'running' && (
                      <div className="text-xs text-accent">Analyse en cours...</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info box */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-muted-foreground">
              Cette analyse vérifie la qualité des données pour chaque type de filtre (NAF, département, taille, forme juridique).
            </div>
          </div>
          
          {/* Action button */}
          <Button 
            onClick={startAnalysis} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyser la qualification
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
