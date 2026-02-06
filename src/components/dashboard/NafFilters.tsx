import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Building2, ChevronDown, ChevronRight, X, Route, Calendar as CalendarIcon, Layers, Scale, MapPin, BarChart3, Building, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressSearchInput } from "./AddressSearchInput";
import { 
  NAF_DIVISIONS, 
  NAF_GROUPES, 
  NAF_CLASSES,
  getDivisionEmoji,
} from "@/utils/nafNomenclatureComplete";
import { NAF_SOUS_CLASSES, getSousClasseLabel } from "@/utils/nafSousClasses";
import { CATEGORIES_JURIDIQUES_NIVEAU_I, CATEGORIES_JURIDIQUES_NIVEAU_II, CATEGORIES_JURIDIQUES_NIVEAU_III, getCategorieJuridiqueLabel, getCategorieJuridiqueType } from "@/utils/categoriesJuridiques";
import { B2B_LEGAL_CATEGORY_WHITELIST } from "@/utils/b2bLegalCategoryWhitelist";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";

// Labels pour les tailles d'entreprise
const TAILLE_LABELS: Record<string, string> = {
  'GE': 'Grande Entreprise (GE)',
  'ETI': 'Entreprise Taille Intermédiaire (ETI)',
  'PME': 'Petite/Moyenne Entreprise (PME)',
  'Non spécifié': 'Taille inconnue, nouvelle entreprise'
};

// Labels pour les types d'évènement
const TYPE_EVENEMENT_LABELS: Record<string, string> = {
  'siege': 'Nouvelle entreprise',
  'site': 'Nouveau site'
};

// Helper pour formater le double compteur
const formatDualCount = (contextual: number, global: number, hasFilters: boolean) => {
  if (!hasFilters || contextual === global) {
    return <span className="text-muted-foreground text-xs tabular-nums">{contextual.toLocaleString('fr-FR')}</span>;
  }
  return (
    <span className="text-xs tabular-nums">
      <span className="text-accent font-medium">{contextual.toLocaleString('fr-FR')}</span>
      <span className="text-muted-foreground/50 mx-0.5">/</span>
      <span className="text-muted-foreground/70">{global.toLocaleString('fr-FR')}</span>
    </span>
  );
};

interface NafFiltersProps {
  filters: {
    searchQuery?: string;
    nafSections?: string[];
    nafDivisions?: string[];
    nafGroupes?: string[];
    nafClasses?: string[];
    nafSousClasses?: string[];
    departments?: string[];
    taillesEntreprise?: string[];
    categoriesJuridiques?: string[];
    typesEtablissement?: string[];
    dateCreationFrom?: string;
    dateCreationTo?: string;
    showUnlockedOnly?: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resultsCount?: number;
  totalCount?: number;
  tourneeActive?: boolean;
  onToggleTournee?: () => void;
  tourneeName?: string;
  setTourneeName?: (name: string) => void;
  tourneeDate?: string;
  setTourneeDate?: (date: string) => void;
  selectedCount?: number;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  startAddress?: string;
  startLat?: number;
  startLng?: number;
  onStartPointChange?: (address: string, lat: number, lng: number) => void;
}

// Type pour les niveaux d'expansion
type ExpandedLevel = {
  divisions: string[];
  groupes: string[];
  classes: string[];
};

export const NafFilters = ({ 
  filters, 
  setFilters,
  resultsCount = 0,
  totalCount = 0,
  tourneeActive,
  onToggleTournee,
  tourneeName,
  setTourneeName,
  tourneeDate,
  setTourneeDate,
  selectedCount = 0,
  onOptimize,
  isOptimizing = false,
  startAddress,
  startLat,
  startLng,
  onStartPointChange
}: NafFiltersProps) => {
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [taillesEntrepriseOpen, setTaillesEntrepriseOpen] = useState(false);
  const [categoriesJuridiquesOpen, setCategoriesJuridiquesOpen] = useState(false);
  const [typesEvenementOpen, setTypesEvenementOpen] = useState(false);
  const [dateCreationOpen, setDateCreationOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedLevel>({
    divisions: [],
    groupes: [],
    classes: []
  });
  const [expandedCategoriesJuridiques, setExpandedCategoriesJuridiques] = useState<string[]>([]);
  const [nafSearchQuery, setNafSearchQuery] = useState("");
  
  const { isAdmin } = useAdminStatus();
  // Pass current filters to get contextual/dynamic counts
  const { data: availableFilters, isLoading, isFetching } = useAvailableNouveauxSitesFilters({
    nafSections: filters.nafSections,
    nafDivisions: filters.nafDivisions,
    departments: filters.departments,
    taillesEntreprise: filters.taillesEntreprise,
    categoriesJuridiques: filters.categoriesJuridiques,
    typesEtablissement: filters.typesEtablissement,
    searchQuery: filters.searchQuery
  });

  // Check if any filters are active (to show dual counts)
  const hasActiveFilters = 
    (filters.nafSections?.length || 0) > 0 ||
    (filters.nafDivisions?.length || 0) > 0 ||
    (filters.departments?.length || 0) > 0 ||
    (filters.taillesEntreprise?.length || 0) > 0 ||
    (filters.categoriesJuridiques?.length || 0) > 0 ||
    (filters.typesEtablissement?.length || 0) > 0 ||
    (filters.searchQuery?.trim() || '').length > 0;

  // Get selected NAF codes to keep them visible even if count is 0
  const selectedNafDivisions = filters.nafDivisions || [];
  const selectedNafGroupes = filters.nafGroupes || [];
  const selectedNafClasses = filters.nafClasses || [];
  const selectedNafSousClasses = filters.nafSousClasses || [];

  // Construire la hiérarchie NAF par DIVISIONS (point d'entrée numérique)
  // On affiche TOUTES les divisions/groupes/classes de la nomenclature pour permettre la multi-sélection
  // même quand les compteurs dynamiques tombent à 0 après un premier choix.
  const nafHierarchy = useMemo(() => {
    const contextual = availableFilters?.contextual;
    const global = availableFilters?.global;
    
    // On construit toujours la hiérarchie complète, les counts servent d'indication
    const divisions = Object.entries(NAF_DIVISIONS)
      .map(([divCode, divInfo]) => {
        const divisionCount = (contextual?.nafDivisions?.[divCode] as number) || 0;
        const divisionGlobalCount = (global?.nafDivisions?.[divCode] as number) || 0;
        const isDivisionSelected = selectedNafDivisions.includes(divCode);
        
        // Groupes de cette division
        const groupes = Object.entries(NAF_GROUPES)
          .filter(([_, grpInfo]) => grpInfo.division === divCode)
          .map(([grpCode, grpInfo]) => {
            const groupeCount = (contextual?.nafGroupes?.[grpCode] as number) || 0;
            const groupeGlobalCount = (global?.nafGroupes?.[grpCode] as number) || 0;
            const isGroupeSelected = selectedNafGroupes.includes(grpCode);
            
            // Classes de ce groupe
            const classes = Object.entries(NAF_CLASSES)
              .filter(([_, clsInfo]) => clsInfo.groupe === grpCode)
              .map(([clsCode, clsInfo]) => {
                const classeCount = (contextual?.nafClasses?.[clsCode] as number) || 0;
                const classeGlobalCount = (global?.nafClasses?.[clsCode] as number) || 0;
                const isClasseSelected = selectedNafClasses.includes(clsCode);
                
                // Sous-classes de cette classe (depuis NAF_SOUS_CLASSES)
                const sousClasses = Object.entries(NAF_SOUS_CLASSES)
                  .filter(([scCode]) => scCode.startsWith(clsCode))
                  .map(([scCode, scInfo]) => {
                    const scCount = (contextual?.nafSousClasses?.[scCode] as number) || 0;
                    const scGlobalCount = (global?.nafSousClasses?.[scCode] as number) || 0;
                    return {
                      code: scCode,
                      label: scInfo.label,
                      count: scCount,
                      globalCount: scGlobalCount
                    };
                  })
                  .sort((a, b) => a.code.localeCompare(b.code));
                
                return {
                  code: clsCode,
                  label: clsInfo.label,
                  count: classeCount,
                  globalCount: classeGlobalCount,
                  sousClasses,
                  isSelected: isClasseSelected
                };
              })
              .sort((a, b) => a.code.localeCompare(b.code));
            
            return {
              code: grpCode,
              label: grpInfo.label,
              count: groupeCount,
              globalCount: groupeGlobalCount,
              classes,
              isSelected: isGroupeSelected
            };
          })
          .sort((a, b) => a.code.localeCompare(b.code));
        
        return {
          code: divCode,
          label: divInfo.label,
          emoji: getDivisionEmoji(divCode),
          count: divisionCount,
          globalCount: divisionGlobalCount,
          groupes,
          isSelected: isDivisionSelected
        };
       })
       .sort((a, b) => a.code.localeCompare(b.code)); // Tri numérique croissant

    return divisions;
  }, [availableFilters, selectedNafDivisions, selectedNafGroupes, selectedNafClasses, selectedNafSousClasses]);

  // Filtrer par recherche
  const filteredHierarchy = useMemo(() => {
    if (!nafSearchQuery.trim()) return nafHierarchy;
    
    const query = nafSearchQuery.toLowerCase();
    
    return nafHierarchy.filter(division => {
      const divisionMatch = division.code.toLowerCase().includes(query) || 
                          division.label.toLowerCase().includes(query);
      
      const hasMatchingGroupe = division.groupes.some(grp => 
        grp.code.toLowerCase().includes(query) || 
        grp.label.toLowerCase().includes(query) ||
        grp.classes.some(cls =>
          cls.code.toLowerCase().includes(query) ||
          cls.label.toLowerCase().includes(query) ||
          cls.sousClasses.some(sc => sc.code.toLowerCase().includes(query))
        )
      );
      
      return divisionMatch || hasMatchingGroupe;
    });
  }, [nafHierarchy, nafSearchQuery]);

  // Départements : on affiche TOUJOURS la liste (01-95) pour permettre la multi-sélection.
  // Les compteurs dynamiques peuvent tomber à 0 après un premier choix (car les counts se basent
  // sur les filtres courants), mais l'utilisateur doit pouvoir ajouter d'autres départements.
  const selectedDepartments = filters.departments || [];
  const allDepartments = useMemo(() => {
    return Object.keys(DEPARTMENT_NAMES).sort((a, b) => {
      const na = Number.parseInt(a, 10);
      const nb = Number.parseInt(b, 10);
      if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
      return na - nb;
    });
  }, []);

  const availableDepartments = useMemo(() => {
    const contextualCounts = (availableFilters?.contextual?.departments || {}) as Record<string, number>;
    const globalCounts = (availableFilters?.global?.departments || {}) as Record<string, number>;
    // Keep numeric order (01, 02, 03, ... 95) - no sorting by count or selection
    return allDepartments.map((dept) => ({ 
      dept, 
      count: Number(contextualCounts[dept] ?? 0),
      globalCount: Number(globalCounts[dept] ?? 0)
    }));
  }, [availableFilters, allDepartments]);

  // Tailles : on affiche GE/ETI/PME + Non spécifié pour permettre la multi-sélection.
  const VALID_TAILLES = ['GE', 'ETI', 'PME', 'Non spécifié'];
  const selectedTailles = filters.taillesEntreprise || [];
  const availableTailles = useMemo(() => {
    const contextualCounts = (availableFilters?.contextual?.taillesEntreprise || {}) as Record<string, number>;
    const globalCounts = (availableFilters?.global?.taillesEntreprise || {}) as Record<string, number>;
    // Keep fixed order: GE, ETI, PME, Non spécifié
    return VALID_TAILLES.map((taille) => ({
      taille,
      label: TAILLE_LABELS[taille] || taille,
      count: Number(contextualCounts[taille] ?? 0),
      globalCount: Number(globalCounts[taille] ?? 0),
    }));
  }, [availableFilters]);

  // Structure les catégories juridiques par niveau II (ex: 51, 52, 53, 54, 55, 56, 57, 58)
  // Keep selected items visible even if their count becomes 0
  const selectedCategoriesJuridiques = filters.categoriesJuridiques || [];
  const categoriesJuridiquesHierarchy = useMemo(() => {
    const rawData = availableFilters?.contextual?.categoriesJuridiques || {};
    const globalData = availableFilters?.global?.categoriesJuridiques || {};
    
    // Group by niveau II (first 2 digits)
    const groupedByNiveauII: Record<string, { codes: string[]; totalCount: number; globalCount: number }> = {};

    // Pré-seed avec la whitelist B2B pour que l'utilisateur puisse multi-sélectionner même si les counts valent 0
    B2B_LEGAL_CATEGORY_WHITELIST.forEach((code) => {
      const niveauII = code.substring(0, 2);
      if (!groupedByNiveauII[niveauII]) {
        groupedByNiveauII[niveauII] = { codes: [], totalCount: 0, globalCount: 0 };
      }
      if (!groupedByNiveauII[niveauII].codes.includes(code)) {
        groupedByNiveauII[niveauII].codes.push(code);
      }
    });

    // Puis, injecter les codes réellement présents (avec leurs counts)
    Object.entries(rawData).forEach(([code, count]) => {
      if (!code || code === 'null' || code === '') {
        // Handle "Non spécifié"
        if (!groupedByNiveauII['non_specifie']) {
          groupedByNiveauII['non_specifie'] = { codes: [], totalCount: 0, globalCount: 0 };
        }
        groupedByNiveauII['non_specifie'].totalCount += count as number;
        return;
      }
      
      const niveauII = code.substring(0, 2);
      if (!groupedByNiveauII[niveauII]) {
        groupedByNiveauII[niveauII] = { codes: [], totalCount: 0, globalCount: 0 };
      }
      if (!groupedByNiveauII[niveauII].codes.includes(code)) {
        groupedByNiveauII[niveauII].codes.push(code);
      }
      groupedByNiveauII[niveauII].totalCount += count as number;
    });

    // Inject global counts
    Object.entries(globalData).forEach(([code, count]) => {
      if (!code || code === 'null' || code === '') {
        if (groupedByNiveauII['non_specifie']) {
          groupedByNiveauII['non_specifie'].globalCount += count as number;
        }
        return;
      }
      const niveauII = code.substring(0, 2);
      if (groupedByNiveauII[niveauII]) {
        groupedByNiveauII[niveauII].globalCount += count as number;
      }
    });
    
    // Add selected codes that might not be in rawData (count = 0)
    selectedCategoriesJuridiques.forEach(code => {
      if (!code || code === 'null' || code === '' || code === 'non_specifie') {
        if (!groupedByNiveauII['non_specifie']) {
          groupedByNiveauII['non_specifie'] = { codes: [], totalCount: 0, globalCount: 0 };
        }
        return;
      }
      const niveauII = code.substring(0, 2);
      if (!groupedByNiveauII[niveauII]) {
        groupedByNiveauII[niveauII] = { codes: [], totalCount: 0, globalCount: 0 };
      }
      if (!groupedByNiveauII[niveauII].codes.includes(code)) {
        groupedByNiveauII[niveauII].codes.push(code);
      }
    });
    
    // Convert to array with labels from NIVEAU_II
    const hierarchy = Object.entries(groupedByNiveauII)
      .map(([niveauII, data]) => {
        if (niveauII === 'non_specifie') {
          const isSelected = selectedCategoriesJuridiques.includes('non_specifie');
          return {
            niveauII: 'non_specifie',
            label: 'Non spécifié',
            count: data.totalCount,
            globalCount: data.globalCount,
            codes: ['non_specifie'],
            subCategories: [],
            isSelected
          };
        }
        
        const niveauIIInfo = CATEGORIES_JURIDIQUES_NIVEAU_II[niveauII];
        const label = niveauIIInfo?.label || `Catégorie ${niveauII}`;
        
        // Get detail for each code (niveau III)
        const subCategories = data.codes.map(code => {
          const niveauIII = CATEGORIES_JURIDIQUES_NIVEAU_III[code];
          const isSelected = selectedCategoriesJuridiques.includes(code);
          return {
            code,
            label: niveauIII?.label || `Code ${code}`,
            count: (rawData[code] as number) || 0,
            globalCount: (globalData[code] as number) || 0,
            isSelected
          };
         }).sort((a, b) => b.count - a.count);
        
        const hasSelectedChild = subCategories.some(sc => sc.isSelected);
        
        return {
          niveauII,
          label,
          count: data.totalCount,
          globalCount: data.globalCount,
          codes: data.codes,
          subCategories,
          isSelected: hasSelectedChild
        };
       })
       .sort((a, b) => {
        if (a.niveauII === 'non_specifie') return 1;
        if (b.niveauII === 'non_specifie') return -1;
        return b.count - a.count;
      });
    
    return hierarchy;
  }, [availableFilters, selectedCategoriesJuridiques]);

  const selectedTypesEtablissement = filters.typesEtablissement || [];
  const availableTypesEvenement = useMemo(() => {
    const contextualCounts = (availableFilters?.contextual?.typesEtablissement || {}) as Record<string, number>;
    const globalCounts = (availableFilters?.global?.typesEtablissement || {}) as Record<string, number>;
    const allTypes = Object.keys(TYPE_EVENEMENT_LABELS);

    return allTypes
      .map((type) => ({
        type,
        label: TYPE_EVENEMENT_LABELS[type] || type,
        count: Number(contextualCounts[type] ?? 0),
        globalCount: Number(globalCounts[type] ?? 0),
      }))
      .sort((a, b) => {
        const aSel = selectedTypesEtablissement.includes(a.type);
        const bSel = selectedTypesEtablissement.includes(b.type);
        if (aSel !== bSel) return aSel ? -1 : 1;
        return b.count - a.count;
      });
  }, [availableFilters, selectedTypesEtablissement]);
  // Toggle functions pour l'expansion
  const toggleExpand = (level: keyof ExpandedLevel, code: string) => {
    setExpanded(prev => ({
      ...prev,
      [level]: prev[level].includes(code) 
        ? prev[level].filter(c => c !== code)
        : [...prev[level], code]
    }));
  };

  // Handlers pour la sélection des filtres
  const handleDivisionToggle = (divisionCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafDivisions || [];
      const isSelected = current.includes(divisionCode);
      
      let newGroupes = prev.nafGroupes || [];
      let newClasses = prev.nafClasses || [];
      let newSousClasses = prev.nafSousClasses || [];
      
      if (isSelected) {
        const divGroupes = Object.entries(NAF_GROUPES)
          .filter(([_, info]) => info.division === divisionCode)
          .map(([code]) => code);
        newGroupes = newGroupes.filter((g: string) => !divGroupes.includes(g));
        
        const divClasses = Object.entries(NAF_CLASSES)
          .filter(([_, info]) => divGroupes.includes(info.groupe))
          .map(([code]) => code);
        newClasses = newClasses.filter((c: string) => !divClasses.includes(c));
        
        newSousClasses = newSousClasses.filter((sc: string) => 
          !divClasses.some(cls => sc.startsWith(cls))
        );
      }
      
      return {
        ...prev,
        nafDivisions: isSelected
          ? current.filter((d: string) => d !== divisionCode)
          : [...current, divisionCode],
        nafGroupes: newGroupes,
        nafClasses: newClasses,
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleGroupeToggle = (groupeCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafGroupes || [];
      const isSelected = current.includes(groupeCode);
      
      let newClasses = prev.nafClasses || [];
      let newSousClasses = prev.nafSousClasses || [];
      
      if (isSelected) {
        const grpClasses = Object.entries(NAF_CLASSES)
          .filter(([_, info]) => info.groupe === groupeCode)
          .map(([code]) => code);
        newClasses = newClasses.filter((c: string) => !grpClasses.includes(c));
        newSousClasses = newSousClasses.filter((sc: string) => 
          !grpClasses.some(cls => sc.startsWith(cls))
        );
      }
      
      return {
        ...prev,
        nafGroupes: isSelected
          ? current.filter((g: string) => g !== groupeCode)
          : [...current, groupeCode],
        nafClasses: newClasses,
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleClasseToggle = (classeCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafClasses || [];
      const isSelected = current.includes(classeCode);
      
      let newSousClasses = prev.nafSousClasses || [];
      if (isSelected) {
        newSousClasses = newSousClasses.filter((sc: string) => !sc.startsWith(classeCode));
      }
      
      return {
        ...prev,
        nafClasses: isSelected
          ? current.filter((c: string) => c !== classeCode)
          : [...current, classeCode],
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleSousClasseToggle = (sousClasseCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafSousClasses || [];
      const isSelected = current.includes(sousClasseCode);
      
      return {
        ...prev,
        nafSousClasses: isSelected
          ? current.filter((sc: string) => sc !== sousClasseCode)
          : [...current, sousClasseCode]
      };
    });
  };

  const handleDepartmentToggle = (dept: string) => {
    setFilters((prev: any) => {
      const current = prev.departments || [];
      const isSelected = current.includes(dept);
      
      return {
        ...prev,
        departments: isSelected
          ? current.filter((d: string) => d !== dept)
          : [...current, dept]
      };
    });
  };

  const handleTailleEntrepriseToggle = (taille: string) => {
    setFilters((prev: any) => {
      const current = prev.taillesEntreprise || [];
      const isSelected = current.includes(taille);
      
      return {
        ...prev,
        taillesEntreprise: isSelected
          ? current.filter((t: string) => t !== taille)
          : [...current, taille]
      };
    });
  };

  const handleCategorieJuridiqueToggle = (code: string) => {
    setFilters((prev: any) => {
      const current = prev.categoriesJuridiques || [];
      const isSelected = current.includes(code);
      
      return {
        ...prev,
        categoriesJuridiques: isSelected
          ? current.filter((c: string) => c !== code)
          : [...current, code]
      };
    });
  };

  // Toggle tout un groupe de catégories juridiques (niveau II)
  const handleCategorieJuridiqueGroupeToggle = (codes: string[]) => {
    setFilters((prev: any) => {
      const current = prev.categoriesJuridiques || [];
      const allSelected = codes.every(code => current.includes(code));
      
      if (allSelected) {
        // Désélectionner tous les codes du groupe
        return {
          ...prev,
          categoriesJuridiques: current.filter((c: string) => !codes.includes(c))
        };
      } else {
        // Sélectionner tous les codes du groupe
        const newSelection = [...current];
        codes.forEach(code => {
          if (!newSelection.includes(code)) {
            newSelection.push(code);
          }
        });
        return {
          ...prev,
          categoriesJuridiques: newSelection
        };
      }
    });
  };

  const toggleCategorieJuridiqueExpand = (niveauII: string) => {
    setExpandedCategoriesJuridiques(prev => 
      prev.includes(niveauII) 
        ? prev.filter(n => n !== niveauII)
        : [...prev, niveauII]
    );
  };

  const handleTypeEtablissementToggle = (type: string) => {
    setFilters((prev: any) => {
      const current = prev.typesEtablissement || [];
      const isSelected = current.includes(type);
      
      return {
        ...prev,
        typesEtablissement: isSelected
          ? current.filter((t: string) => t !== type)
          : [...current, type]
      };
    });
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    nafSections: [], 
    nafDivisions: [],
    nafGroupes: [],
    nafClasses: [],
    nafSousClasses: [],
    departments: [],
    taillesEntreprise: [],
    categoriesJuridiques: [],
    typesEtablissement: [],
    dateCreationFrom: undefined,
    dateCreationTo: undefined,
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.nafDivisions?.length || 0) +
    (filters.nafGroupes?.length || 0) +
    (filters.nafClasses?.length || 0) +
    (filters.nafSousClasses?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.taillesEntreprise?.length || 0) +
    (filters.categoriesJuridiques?.length || 0) +
    (filters.typesEtablissement?.length || 0) +
    (filters.dateCreationFrom ? 1 : 0) +
    (filters.dateCreationTo ? 1 : 0);

  // Composant pour afficher une checkbox
  const Checkbox = ({ selected, size = "md" }: { selected: boolean; size?: "sm" | "md" }) => {
    const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    const innerSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
    return (
      <div className={`${sizeClasses} rounded border-2 flex items-center justify-center shrink-0 ${
        selected ? 'bg-accent border-accent' : 'border-accent/30'
      }`}>
        {selected && <div className={`${innerSize} bg-white rounded-sm`} />}
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {/* Panneau de création de tournée */}
      {onToggleTournee && (
        <div className="p-4 border-b border-accent/20">
          <Button
            onClick={onToggleTournee}
            variant={tourneeActive ? "default" : "outline"}
            className={`w-full ${
              tourneeActive 
                ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 text-primary" 
                : "border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            } transition-all h-9`}
            size="sm"
          >
            <Route className="w-4 h-4 mr-2" />
            {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
          </Button>
          
          {tourneeActive && setTourneeName && setTourneeDate && onOptimize && (
            <div className="space-y-3 p-3 mt-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="tournee-name" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
                <Input
                  id="tournee-name"
                  placeholder="Ex: Tournée Sud"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                  className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tournee-date" className="text-xs font-semibold text-accent">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tourneeDate ? format(new Date(tourneeDate), "dd/MM/yyyy") : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tourneeDate ? new Date(tourneeDate) : undefined}
                      onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Point de départ */}
              {onStartPointChange && (
                <AddressSearchInput
                  onAddressSelect={onStartPointChange}
                  selectedAddress={startAddress}
                  selectedLat={startLat}
                  selectedLng={startLng}
                />
              )}
              
              {selectedCount > 0 && (
                <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
                  {selectedCount} site(s) sélectionné(s)
                </div>
              )}
              <Button
                onClick={onOptimize}
                disabled={selectedCount < 2 || isOptimizing}
                className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors disabled:opacity-50"
                size="sm"
              >
                <Route className="w-3.5 h-3.5 mr-2" />
                {isOptimizing ? "Optimisation..." : "Optimiser la tournée"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="p-4 border-b border-accent/20 space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher (ex: boulangerie paris)..."
            value={filters.searchQuery || ""}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
            className="pl-8 h-8 text-xs bg-background/50 border-accent/20 focus:border-accent/40"
          />
          {isFetching && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {/* Compteur de résultats */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-accent" />
          <span className="font-semibold text-foreground">{resultsCount.toLocaleString('fr-FR')}</span>
          <span className="text-muted-foreground">établissement{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}</span>
          {isFetching && <span className="text-xs text-muted-foreground">(mise à jour...)</span>}
        </div>

        {/* Chips des filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.nafDivisions?.map((code: string) => (
              <span
                key={`division-${code}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/15 text-accent rounded-full border border-accent/30"
              >
                <span className="font-medium">{getDivisionEmoji(code)} {code}</span>
                <button
                  onClick={() => handleDivisionToggle(code)}
                  className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.nafGroupes?.map((code: string) => (
              <span
                key={`groupe-${code}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent/10 text-foreground rounded-full border border-accent/20"
              >
                <span>{code}</span>
                <button
                  onClick={() => handleGroupeToggle(code)}
                  className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.departments?.map((dept: string) => (
              <span
                key={`dept-${dept}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/30"
              >
                <span>Dép. {dept}</span>
                <button
                  onClick={() => handleDepartmentToggle(dept)}
                  className="hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.taillesEntreprise?.map((taille: string) => (
              <span
                key={`taille-${taille}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/30"
              >
                <span>{taille}</span>
                <button
                  onClick={() => handleTailleEntrepriseToggle(taille)}
                  className="hover:bg-purple-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.categoriesJuridiques?.map((code: string) => (
              <span
                key={`catjur-${code}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/30"
              >
                <Scale className="w-3 h-3" />
                <span>Cat. {code}</span>
                <button
                  onClick={() => handleCategorieJuridiqueToggle(code)}
                  className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.typesEtablissement?.map((type: string) => (
              <span
                key={`type-${type}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30"
              >
                <Building className="w-3 h-3" />
                <span>{type === 'siege' ? 'Nouvelle entreprise' : 'Nouveau site'}</span>
                <button
                  onClick={() => handleTypeEtablissementToggle(type)}
                  className="hover:bg-emerald-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.dateCreationFrom || filters.dateCreationTo) && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/30"
              >
                <CalendarIcon className="w-3 h-3" />
                <span>
                  {filters.dateCreationFrom && filters.dateCreationTo
                    ? `${format(new Date(filters.dateCreationFrom), "dd/MM")} - ${format(new Date(filters.dateCreationTo), "dd/MM")}`
                    : filters.dateCreationFrom 
                      ? `Depuis ${format(new Date(filters.dateCreationFrom), "dd/MM")}`
                      : `Jusqu'au ${format(new Date(filters.dateCreationTo!), "dd/MM")}`
                  }
                </span>
                <button
                  onClick={() => setFilters((prev: any) => ({
                    ...prev,
                    dateCreationFrom: undefined,
                    dateCreationTo: undefined
                  }))}
                  className="hover:bg-orange-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeFiltersCount > 2 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded-full border border-destructive/30 hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3 h-3" />
                Tout effacer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nomenclature NAF hiérarchique - Point d'entrée: DIVISIONS */}
      <Collapsible open={sectionsOpen} onOpenChange={setSectionsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Secteur d'activité (NAF)</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          {/* Recherche dans la nomenclature */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher (ex: 43, construction)..."
                value={nafSearchQuery}
                onChange={(e) => setNafSearchQuery(e.target.value)}
                className="pl-7 h-7 text-xs bg-background/50 border-accent/20"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[450px]">
            <div className="px-4 pb-4 space-y-0.5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : filteredHierarchy.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun secteur trouvé
                </div>
              ) : (
                filteredHierarchy.map((division) => {
                  const divisionSelected = filters.nafDivisions?.includes(division.code);
                  const divisionExpanded = expanded.divisions.includes(division.code);
                  
                  return (
                    <div key={division.code} className="space-y-0.5">
                      {/* Niveau 1: Division (point d'entrée) */}
                      <div className="flex items-start gap-1">
                        {division.groupes.length > 0 && (
                          <button
                            onClick={() => toggleExpand('divisions', division.code)}
                            className="p-1 hover:bg-accent/10 rounded mt-1"
                          >
                            {divisionExpanded ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <div
                          onClick={() => handleDivisionToggle(division.code)}
                          className="flex items-start gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors active:scale-[0.98] flex-1"
                        >
                          <Checkbox selected={divisionSelected} />
                          <span className="text-base shrink-0">{division.emoji}</span>
                          <span className="text-xs font-medium text-accent shrink-0 font-mono">{division.code}</span>
                          <span className="text-sm leading-snug flex-1 break-words">{division.label}</span>
                          {formatDualCount(division.count, division.globalCount, hasActiveFilters)}
                        </div>
                      </div>
                      
                      {/* Niveau 2: Groupes */}
                      {divisionExpanded && division.groupes.map((groupe) => {
                        const groupeSelected = filters.nafGroupes?.includes(groupe.code);
                        const groupeExpanded = expanded.groupes.includes(groupe.code);
                        
                        return (
                          <div key={groupe.code} className="ml-6 space-y-0.5">
                            <div className="flex items-start gap-1 border-l-2 border-accent/20 pl-2">
                              {groupe.classes.length > 0 && (
                                <button
                                  onClick={() => toggleExpand('groupes', groupe.code)}
                                  className="p-0.5 hover:bg-accent/10 rounded mt-1"
                                >
                                  {groupeExpanded ? (
                                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                              <div
                                onClick={() => handleGroupeToggle(groupe.code)}
                                className="flex items-start gap-2 cursor-pointer hover:bg-accent/10 p-1.5 rounded transition-colors active:scale-[0.98] flex-1"
                              >
                                <Checkbox selected={groupeSelected} size="sm" />
                                <span className="text-xs font-mono text-accent/80 shrink-0">{groupe.code}</span>
                                <span className="text-xs leading-snug flex-1 break-words">{groupe.label}</span>
                                {formatDualCount(groupe.count, groupe.globalCount, hasActiveFilters)}
                              </div>
                            </div>
                            
                            {/* Niveau 3: Classes */}
                            {groupeExpanded && groupe.classes.map((classe) => {
                              const classeSelected = filters.nafClasses?.includes(classe.code);
                              const classeExpanded = expanded.classes.includes(classe.code);
                              
                              return (
                                <div key={classe.code} className="ml-5 space-y-0.5">
                                  <div className="flex items-start gap-1 border-l-2 border-accent/15 pl-2">
                                    {classe.sousClasses.length > 0 && (
                                      <button
                                        onClick={() => toggleExpand('classes', classe.code)}
                                        className="p-0.5 hover:bg-accent/10 rounded"
                                      >
                                        {classeExpanded ? (
                                          <ChevronDown className="w-2 h-2 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-2 h-2 text-muted-foreground" />
                                        )}
                                      </button>
                                    )}
                                    <div
                                      onClick={() => handleClasseToggle(classe.code)}
                                      className="flex items-start gap-1.5 cursor-pointer hover:bg-accent/10 p-1 rounded transition-colors active:scale-[0.98] flex-1"
                                    >
                                      <Checkbox selected={classeSelected} size="sm" />
                                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">{classe.code}</span>
                                      <span className="text-[11px] leading-snug flex-1 break-words">{classe.label}</span>
                                      {formatDualCount(classe.count, classe.globalCount, hasActiveFilters)}
                                    </div>
                                  </div>
                                  
                                  {/* Niveau 4: Sous-classes - Masquer si unique et même count que parent */}
                                  {classeExpanded && !(classe.sousClasses.length === 1 && classe.sousClasses[0].count === classe.count) && classe.sousClasses.map((sousClasse) => {
                                    const sousClasseSelected = filters.nafSousClasses?.includes(sousClasse.code);
                                    
                                    return (
                                      <div key={sousClasse.code} className="ml-4">
                                        <div
                                          onClick={() => handleSousClasseToggle(sousClasse.code)}
                                          className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/10 p-1 rounded transition-colors active:scale-[0.98] border-l border-accent/10 pl-2"
                                        >
                                          <Checkbox selected={sousClasseSelected} size="sm" />
                                          <span className="text-[10px] font-mono text-accent/60 shrink-0">{sousClasse.code}</span>
                                          <span className="text-[10px] leading-snug flex-1 break-words ml-1">{sousClasse.label}</span>
                                          {formatDualCount(sousClasse.count, sousClasse.globalCount, hasActiveFilters)}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Départements */}
      <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Départements</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[300px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableDepartments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun département disponible
                </div>
              ) : (
                availableDepartments.map(({ dept, count, globalCount }) => {
                  const selected = filters.departments?.includes(dept);
                  return (
                    <div
                      key={dept}
                      onClick={() => handleDepartmentToggle(dept)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <Checkbox selected={selected} />
                      <span className="text-sm flex-1">{dept} - {DEPARTMENT_NAMES[dept] || dept}</span>
                      {formatDualCount(count, globalCount, hasActiveFilters)}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Taille d'entreprise */}
      <Collapsible open={taillesEntrepriseOpen} onOpenChange={setTaillesEntrepriseOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Taille d'entreprise</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${taillesEntrepriseOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className={`${availableTailles.length <= 4 ? '' : 'max-h-[200px]'}`}>
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableTailles.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune taille disponible
                </div>
              ) : (
                availableTailles.map(({ taille, label, count, globalCount }) => {
                  const selected = filters.taillesEntreprise?.includes(taille);
                  return (
                    <div
                      key={taille}
                      onClick={() => handleTailleEntrepriseToggle(taille)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <Checkbox selected={selected} />
                      <span className="text-sm flex-1">{label}</span>
                      {formatDualCount(count, globalCount, hasActiveFilters)}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Siège social - Collapsible avec Oui/Non */}
      <Collapsible open={typesEvenementOpen} onOpenChange={setTypesEvenementOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Siège social</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${typesEvenementOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* Oui = siège */}
                {(() => {
                  const siegeData = availableTypesEvenement.find(t => t.type === 'siege');
                  const siegeCount = siegeData?.count || 0;
                  const siegeGlobalCount = siegeData?.globalCount || 0;
                  const selected = filters.typesEtablissement?.includes('siege');
                  return (
                    <button
                      onClick={() => handleTypeEtablissementToggle('siege')}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98] ${
                        selected
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/50'
                          : 'bg-muted/50 hover:bg-emerald-500/10 border border-border/50 text-foreground hover:border-emerald-500/30'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${selected ? 'bg-white/20' : 'bg-emerald-500/10'}`}>
                        <Building className={`w-4 h-4 ${selected ? 'text-white' : 'text-emerald-500'}`} />
                      </div>
                      <span className={`flex-1 text-left text-sm ${selected ? 'text-white font-medium' : 'text-foreground'}`}>Oui</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums ${
                        selected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {hasActiveFilters && siegeCount !== siegeGlobalCount 
                          ? `${siegeCount.toLocaleString('fr-FR')} / ${siegeGlobalCount.toLocaleString('fr-FR')}`
                          : siegeCount.toLocaleString('fr-FR')
                        }
                      </span>
                    </button>
                  );
                })()}
                {/* Non = établissement secondaire */}
                {(() => {
                  const siteData = availableTypesEvenement.find(t => t.type === 'site');
                  const nonSiegeCount = siteData?.count || 0;
                  const nonSiegeGlobalCount = siteData?.globalCount || 0;
                  const selected = filters.typesEtablissement?.includes('etablissement');
                  return (
                    <button
                      onClick={() => handleTypeEtablissementToggle('etablissement')}
                      className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-[0.98] ${
                        selected
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/50'
                          : 'bg-muted/50 hover:bg-blue-500/10 border border-border/50 text-foreground hover:border-blue-500/30'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${selected ? 'bg-white/20' : 'bg-blue-500/10'}`}>
                        <MapPin className={`w-4 h-4 ${selected ? 'text-white' : 'text-blue-500'}`} />
                      </div>
                      <span className={`flex-1 text-left text-sm ${selected ? 'text-white font-medium' : 'text-foreground'}`}>Non</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums ${
                        selected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {hasActiveFilters && nonSiegeCount !== nonSiegeGlobalCount 
                          ? `${nonSiegeCount.toLocaleString('fr-FR')} / ${nonSiegeGlobalCount.toLocaleString('fr-FR')}`
                          : nonSiegeCount.toLocaleString('fr-FR')
                        }
                      </span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filtre par date de création - Collapsible */}
      <Collapsible open={dateCreationOpen} onOpenChange={setDateCreationOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Date de création</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${dateCreationOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex flex-col gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Du</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {filters.dateCreationFrom 
                        ? format(new Date(filters.dateCreationFrom), "dd/MM/yyyy") 
                        : <span className="text-muted-foreground">Date début</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateCreationFrom ? new Date(filters.dateCreationFrom) : undefined}
                      onSelect={(date) => setFilters((prev: any) => ({ 
                        ...prev, 
                        dateCreationFrom: date ? format(date, "yyyy-MM-dd") : undefined 
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Au</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {filters.dateCreationTo 
                        ? format(new Date(filters.dateCreationTo), "dd/MM/yyyy") 
                        : <span className="text-muted-foreground">Date fin</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateCreationTo ? new Date(filters.dateCreationTo) : undefined}
                      onSelect={(date) => setFilters((prev: any) => ({ 
                        ...prev, 
                        dateCreationTo: date ? format(date, "yyyy-MM-dd") : undefined 
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Boutons raccourcis dates */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 hover:bg-accent/10"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today);
                  lastWeek.setDate(today.getDate() - 7);
                  setFilters((prev: any) => ({
                    ...prev,
                    dateCreationFrom: format(lastWeek, "yyyy-MM-dd"),
                    dateCreationTo: format(today, "yyyy-MM-dd")
                  }));
                }}
              >
                7 derniers jours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 hover:bg-accent/10"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today);
                  lastMonth.setMonth(today.getMonth() - 1);
                  setFilters((prev: any) => ({
                    ...prev,
                    dateCreationFrom: format(lastMonth, "yyyy-MM-dd"),
                    dateCreationTo: format(today, "yyyy-MM-dd")
                  }));
                }}
              >
                30 derniers jours
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 hover:bg-accent/10"
                onClick={() => {
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  setFilters((prev: any) => ({
                    ...prev,
                    dateCreationFrom: format(firstDayOfMonth, "yyyy-MM-dd"),
                    dateCreationTo: format(today, "yyyy-MM-dd")
                  }));
                }}
              >
                Ce mois
              </Button>
              {(filters.dateCreationFrom || filters.dateCreationTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                  onClick={() => setFilters((prev: any) => ({
                    ...prev,
                    dateCreationFrom: undefined,
                    dateCreationTo: undefined
                  }))}
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {activeFiltersCount > 0 && (
        <div className="p-4">
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser les filtres ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );
};
