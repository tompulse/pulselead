import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Building, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getNafCategory } from "@/utils/nafCategories";
import { formatDateCreation } from "@/utils/formatDateSafe";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedEstablishmentsCardProps {
  companyName: string;
  relatedIds: string[];
  onClose: () => void;
}

export const RelatedEstablishmentsCard = ({
  companyName,
  relatedIds,
  onClose
}: RelatedEstablishmentsCardProps) => {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEstablishments = async () => {
      if (!relatedIds?.length) {
        setEstablishments([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const ids = relatedIds.filter(Boolean).map(String);
        let result = await supabase
          .from('nouveaux_sites')
          .select('*')
          .in('id', ids);

        if (result.error && (result.error as { code?: string }).code === '22P02') {
          result = await supabase
            .from('nouveaux_sites')
            .select('*')
            .in('siret', ids);
        }
        if (result.error) throw result.error;
        let data = result.data || [];
        try {
          data = [...data].sort((a, b) => (a?.est_siege === b?.est_siege ? 0 : a?.est_siege ? -1 : 1));
        } catch {
          // ignore sort if column missing
        }
        setEstablishments(data);
      } catch (error) {
        console.error('Error fetching related establishments:', error);
        setEstablishments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstablishments();
  }, [relatedIds]);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-sm rounded-xl border border-accent/40 shadow-xl z-10 flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-right-2 duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-accent/20 bg-accent/5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 hover:bg-accent/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs sm:text-sm gradient-text truncate" title={companyName}>
            {companyName}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            {relatedIds.length} établissement{relatedIds.length > 1 ? 's' : ''}
          </p>
        </div>
        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[10px]">
          ×{relatedIds.length}
        </Badge>
      </div>

      {/* Establishments list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1.5">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </>
        ) : (
          establishments.map((site, index) => {
            const nafInfo = getNafCategory(site.code_naf);
            const addressParts = [
              site.numero_voie,
              site.type_voie,
              site.libelle_voie
            ].filter(Boolean).join(' ');
            
            const fullAddress = addressParts 
              ? `${addressParts}, ${site.code_postal} ${site.ville || ''}`
              : `${site.code_postal || ''} ${site.ville || ''}`.trim();

            return (
              <div
                key={site.id}
                className={`relative rounded-lg p-2.5 border transition-colors ${
                  site.est_siege
                    ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/30'
                    : 'bg-muted/30 border-border/50 hover:border-accent/30'
                }`}
              >
                {/* Index indicator */}
                <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent/50" />
                
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Address */}
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-[10px] sm:text-xs text-foreground/80 break-words">
                        {fullAddress || 'Adresse non spécifiée'}
                      </span>
                    </div>
                    
                    {/* SIRET */}
                    {site.siret && (
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {site.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')}
                        </span>
                      </div>
                    )}
                    
                    {/* Date */}
                    {site.date_creation && formatDateCreation(site.date_creation) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateCreation(site.date_creation)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Badges - Taille d'entreprise retirée pour plus d'espace */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {site.est_siege && (
                      <Badge className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                        Siège
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
