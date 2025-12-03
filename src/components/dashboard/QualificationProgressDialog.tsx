import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Loader2, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QualificationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  count?: number;
  total?: number;
}

interface QualificationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QualificationProgressDialog = ({ open, onOpenChange }: QualificationProgressDialogProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<QualificationStep[]>([
    { id: 'naf', label: 'Catégories NAF', status: 'pending' },
    { id: 'departments', label: 'Départements', status: 'pending' },
    { id: 'sizes', label: 'Tailles entreprises', status: 'pending' },
  ]);

  const updateStep = (id: string, updates: Partial<QualificationStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const qualifyNafCategories = async () => {
    updateStep('naf', { status: 'running' });
    
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true });
      
      updateStep('naf', { total: totalCount || 0 });

      // Invoke edge function
      const { data, error } = await supabase.functions.invoke('harmonize-categories');
      
      if (error) throw error;
      
      // Get count of qualified records
      const { count: qualifiedCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true })
        .not('categorie_detaillee', 'is', null);
      
      updateStep('naf', { status: 'completed', count: qualifiedCount || 0 });
    } catch (error) {
      console.error('NAF qualification error:', error);
      updateStep('naf', { status: 'error' });
      throw error;
    }
  };

  const qualifyDepartments = async () => {
    updateStep('departments', { status: 'running' });
    
    try {
      // Count records with valid postal codes
      const { count: totalCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true })
        .not('code_postal', 'is', null);
      
      updateStep('departments', { total: totalCount || 0 });
      
      // Departments are derived from code_postal (first 2 digits)
      // Just verify the data quality
      const { count: validCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true })
        .not('code_postal', 'is', null)
        .neq('code_postal', '[ND]');
      
      updateStep('departments', { status: 'completed', count: validCount || 0 });
    } catch (error) {
      console.error('Departments qualification error:', error);
      updateStep('departments', { status: 'error' });
      throw error;
    }
  };

  const qualifyCompanySizes = async () => {
    updateStep('sizes', { status: 'running' });
    
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true });
      
      updateStep('sizes', { total: totalCount || 0 });
      
      // Count records with valid company size
      const { count: validCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true })
        .not('categorie_entreprise', 'is', null);
      
      updateStep('sizes', { status: 'completed', count: validCount || 0 });
    } catch (error) {
      console.error('Company sizes qualification error:', error);
      updateStep('sizes', { status: 'error' });
      throw error;
    }
  };

  const startQualification = async () => {
    setIsRunning(true);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', count: undefined, total: undefined })));
    
    try {
      await qualifyNafCategories();
      await qualifyDepartments();
      await qualifyCompanySizes();
      
      toast({
        title: "✅ Qualification terminée",
        description: "Toutes les données ont été qualifiées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de qualification",
        description: "Une erreur s'est produite pendant la qualification",
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
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const overallProgress = () => {
    const completed = steps.filter(s => s.status === 'completed').length;
    return (completed / steps.length) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-accent" />
            Qualification des données
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progression globale</span>
              <span className="font-medium">{Math.round(overallProgress())}%</span>
            </div>
            <Progress value={overallProgress()} className="h-2" />
          </div>
          
          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                {getStepIcon(step.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.label}</div>
                  {step.status === 'completed' && step.count !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {step.count.toLocaleString()} / {step.total?.toLocaleString() || '?'} enregistrements qualifiés
                    </div>
                  )}
                  {step.status === 'running' && (
                    <div className="text-xs text-accent">En cours de qualification...</div>
                  )}
                  {step.status === 'error' && (
                    <div className="text-xs text-destructive">Erreur lors de la qualification</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Action button */}
          <Button 
            onClick={startQualification} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Qualification en cours...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Lancer la qualification
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
