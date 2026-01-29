import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Unlock, Loader2, Sparkles, ArrowRight, Plus, MapPin, Factory, Calendar } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getNafCategory } from "@/utils/nafCategories";

interface UnlockedProspectsViewProps {
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
}

export const UnlockedProspectsView = ({ userId, onEntrepriseSelect }: UnlockedProspectsViewProps) => {
  const { getUnlockedProspects, userPlan } = useUserPlan(userId);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnlockedProspects();
  }, [userId]);

  const loadUnlockedProspects = async () => {
    setLoading(true);
    try {
      const unlockedIds = await getUnlockedProspects();
      
      if (unlockedIds.length === 0) {
        setProspects([]);
        setLoading(false);
        return;
      }

      // Fetch full entreprise data from nouveaux_sites
      const { data, error } = await supabase
        .from('nouveaux_sites')
        .select('*')
        .in('id', unlockedIds.map(u => u.entreprise_id))
        .order('date_creation', { ascending: false });

      if (error) throw error;

      setProspects(data || []);
    } catch (error) {
      console.error('Error loading unlocked prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = userPlan?.prospects_unlocked_count || 0;
  const limit = userPlan?.prospects_limit || 30;
  const remaining = limit - unlockedCount;

  if (loading) {
    return (
      <Card className="glass-card border-accent/20">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto" />
            <p className="text-muted-foreground">Chargement de vos prospects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prospects.length === 0) {
    return (
      <Card className="glass-card border-accent/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Unlock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Aucun prospect débloqué</h3>
            <p className="text-muted-foreground">
              Parcourez la liste des entreprises et cliquez sur <strong className="text-accent">Débloquer</strong> pour 
              ajouter jusqu'à <strong className="text-accent">30 prospects</strong> à votre liste personnelle.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-accent hover:bg-accent/90 text-black font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Débloquer mes premiers prospects
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card className="glass-card border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-cyan-500/20 flex items-center justify-center">
                <Unlock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Mes Prospects Débloqués</h2>
                <p className="text-sm text-muted-foreground">
                  {unlockedCount}/{limit} prospects • {remaining} restants
                </p>
              </div>
            </div>

            {remaining === 0 && (
              <Button 
                onClick={() => navigate('/#pricing')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Passer à PRO
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Prospects débloqués</span>
              <span className={unlockedCount >= limit ? 'text-red-400 font-bold' : ''}>
                {unlockedCount}/{limit}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  unlockedCount >= limit ? 'bg-red-500' : 
                  unlockedCount >= limit * 0.75 ? 'bg-orange-500' : 
                  'bg-accent'
                }`}
                style={{ width: `${Math.min((unlockedCount / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {prospects.map((prospect) => {
          const nafInfo = getNafCategory(prospect.code_naf);
          
          const addressParts = [
            prospect.numero_voie,
            prospect.type_voie,
            prospect.libelle_voie
          ].filter(Boolean).join(' ');
          
          const fullAddress = addressParts 
            ? `${addressParts}, ${prospect.code_postal} ${prospect.ville || ''}`
            : `${prospect.code_postal || ''} ${prospect.ville || ''}`.trim();

          return (
            <Card 
              key={prospect.id}
              className="glass-card border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/20 transition-all cursor-pointer group"
              onClick={() => onEntrepriseSelect && onEntrepriseSelect(prospect)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base line-clamp-2 flex-1 gradient-text">
                    {prospect.nom || prospect.denomination_unite_legale || 'Entreprise'}
                  </h3>
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-1 shrink-0">
                    <Unlock className="w-3 h-3" />
                    Débloqué
                  </Badge>
                </div>

                {/* NAF Info */}
                {nafInfo && (
                  <div className="flex items-center gap-2 text-xs">
                    <Factory className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground line-clamp-1">
                      {nafInfo.category.emoji} {nafInfo.category.label}
                    </span>
                  </div>
                )}

                {/* SIRET */}
                {prospect.siret && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">🏛️</span>
                    <span className="text-muted-foreground font-mono">
                      {prospect.siret.substring(0, 9).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
                    </span>
                  </div>
                )}

                {/* Address */}
                {fullAddress && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2 flex-1">
                      {fullAddress}
                    </span>
                  </div>
                )}

                {/* Date de création */}
                {prospect.date_creation && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Créé le {format(new Date(prospect.date_creation), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                )}

                {/* Hover indicator */}
                <div className="pt-2 border-t border-accent/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-accent text-center font-medium">
                    Cliquer pour voir les détails
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
