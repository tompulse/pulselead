import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AccountMenuProps {
  userEmail?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  daysRemaining?: number;
  endDate?: string;
  onLogout: () => void;
}

export const AccountMenu = ({
  userEmail,
  subscriptionStatus,
  subscriptionPlan,
  daysRemaining,
  endDate,
  onLogout
}: AccountMenuProps) => {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOpenPortal = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL du portail non disponible');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'ouvrir le portail de gestion.'
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleNavigateToSecurity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/security');
  };

  const getStatusConfig = () => {
    switch (subscriptionStatus) {
      case 'trialing':
        return {
          label: 'Essai gratuit',
          icon: Clock,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30'
        };
      case 'active':
        return {
          label: 'Actif',
          icon: CheckCircle2,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30'
        };
      case 'past_due':
        return {
          label: 'Paiement en attente',
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          label: 'Inactif',
          icon: AlertTriangle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/30'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formattedEndDate = endDate 
    ? format(new Date(endDate), 'd MMM yyyy', { locale: fr })
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10 hover:border-accent transition-all duration-300 gap-1"
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden lg:inline max-w-[120px] truncate">
            {userEmail?.split('@')[0] || 'Mon compte'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        {/* Header avec email */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{userEmail || 'Mon compte'}</p>
            <p className="text-xs text-muted-foreground">Commercial Solo</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Statut abonnement */}
        <div className="px-2 py-2">
          <div className={`flex items-center justify-between p-2 rounded-md ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <div>
                <Badge variant="outline" className={`${statusConfig.borderColor} ${statusConfig.color} ${statusConfig.bgColor} text-xs`}>
                  {statusConfig.label}
                </Badge>
                {subscriptionStatus === 'trialing' && daysRemaining !== undefined && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {daysRemaining > 0 ? `${daysRemaining}j restants` : "Expire aujourd'hui"}
                  </p>
                )}
                {subscriptionStatus === 'active' && formattedEndDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Renouvellement le {formattedEndDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Actions */}
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            handleOpenPortal(e as any);
          }}
          disabled={isOpeningPortal}
          className="cursor-pointer"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          <span className="flex-1">{isOpeningPortal ? 'Chargement...' : 'Gérer mon abonnement'}</span>
          <ExternalLink className="w-3 h-3 opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            handleNavigateToSecurity(e as any);
          }}
          className="cursor-pointer"
        >
          <Shield className="w-4 h-4 mr-2" />
          <span>Sécurité & données</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onLogout}
          className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
