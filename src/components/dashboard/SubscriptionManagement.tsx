import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check, X, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Subscription {
  id: string;
  user_id: string;
  subscription_status: 'pending' | 'active' | 'expired' | 'cancelled';
  subscription_plan: 'monthly' | 'quarterly' | 'yearly' | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

interface UserWithSubscription extends Subscription {
  user_email: string;
}

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<UserWithSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'pending' as 'pending' | 'active' | 'expired' | 'cancelled',
    plan: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    months: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer tous les abonnements
      const { data: subs, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Récupérer les emails des utilisateurs  
      const { data: authData, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) throw usersError;
      
      const users = authData?.users || [];

      // Combiner les données avec type assertion
      const combined: UserWithSubscription[] = (subs || []).map((sub: any) => {
        const userEmail = users.find((u: any) => u.id === sub.user_id)?.email || 'Email inconnu';
        return {
          id: sub.id,
          user_id: sub.user_id,
          subscription_status: sub.subscription_status as 'pending' | 'active' | 'expired' | 'cancelled',
          subscription_plan: sub.subscription_plan as 'monthly' | 'quarterly' | 'yearly' | null,
          subscription_start_date: sub.subscription_start_date,
          subscription_end_date: sub.subscription_end_date,
          created_at: sub.created_at,
          user_email: userEmail
        };
      });

      setSubscriptions(combined);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les abonnements'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (sub: UserWithSubscription) => {
    setSelectedUser(sub);
    setEditForm({
      status: sub.subscription_status,
      plan: sub.subscription_plan || 'monthly',
      months: 1
    });
    setDialogOpen(true);
  };

  const handleActivateSubscription = async () => {
    if (!selectedUser) return;

    try {
      const now = new Date();
      const endDate = new Date(now);
      
      // Calculer la date de fin selon le plan et la durée
      if (editForm.plan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + editForm.months);
      } else if (editForm.plan === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + (3 * editForm.months));
      } else if (editForm.plan === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + editForm.months);
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: editForm.status,
          subscription_plan: editForm.plan,
          subscription_start_date: editForm.status === 'active' ? now.toISOString() : null,
          subscription_end_date: editForm.status === 'active' ? endDate.toISOString() : null
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Abonnement mis à jour avec succès'
      });

      setDialogOpen(false);
      fetchSubscriptions();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'abonnement'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'En attente', icon: null },
      active: { variant: 'default', label: 'Actif', icon: <Check className="w-3 h-3" /> },
      expired: { variant: 'destructive', label: 'Expiré', icon: <X className="w-3 h-3" /> },
      cancelled: { variant: 'outline', label: 'Annulé', icon: <X className="w-3 h-3" /> }
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPlanLabel = (plan: string | null) => {
    const labels: Record<string, string> = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel'
    };
    return plan ? labels[plan] : 'Aucun';
  };

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des abonnements</h2>
          <p className="text-sm text-muted-foreground">
            {subscriptions.length} utilisateur{subscriptions.length > 1 ? 's' : ''} inscrit{subscriptions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline">
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="p-4 hover:border-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  <User className="w-5 h-5 text-accent" />
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold">{sub.user_email}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {getPlanLabel(sub.subscription_plan)}
                    </span>
                    {sub.subscription_end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expire le {format(new Date(sub.subscription_end_date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(sub.subscription_status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(sub)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de modification */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
            <DialogDescription>
              {selectedUser?.user_email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Statut</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plan</Label>
              <Select
                value={editForm.plan}
                onValueChange={(value: any) => setEditForm({ ...editForm, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel (69€)</SelectItem>
                  <SelectItem value="quarterly">Trimestriel (166€)</SelectItem>
                  <SelectItem value="yearly">Annuel (496€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Durée d'activation</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={editForm.months}
                onChange={(e) => setEditForm({ ...editForm, months: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editForm.plan === 'monthly' && `${editForm.months} mois`}
                {editForm.plan === 'quarterly' && `${editForm.months * 3} mois (${editForm.months} trimestre${editForm.months > 1 ? 's' : ''})`}
                {editForm.plan === 'yearly' && `${editForm.months} an${editForm.months > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleActivateSubscription}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
