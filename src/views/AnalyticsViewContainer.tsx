import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { AnalyticsKPICards } from "@/components/dashboard/analytics/AnalyticsKPICards";
import { AnalyticsCharts } from "@/components/dashboard/analytics/AnalyticsCharts";
import { AnalyticsTables } from "@/components/dashboard/analytics/AnalyticsTables";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const AnalyticsViewContainer = () => {
  const { 
    tourneeStats, 
    recentTournees,
    crmStats, 
    activityStats, 
    timeSeriesData,
    usersActivity,
    isLoading 
  } = useAdminAnalytics();
  
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-tournee-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-crm-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-activity-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-timeseries'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users-activity'] });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Analytics Admin</h2>
              <p className="text-sm text-muted-foreground">
                Vue globale de l'activité de tous les utilisateurs
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Rafraîchir
          </Button>
        </div>

        {/* KPI Cards */}
        <AnalyticsKPICards 
          tourneeStats={tourneeStats.data}
          crmStats={crmStats.data}
          activityStats={activityStats.data}
          isLoading={isLoading}
        />

        {/* Charts */}
        <AnalyticsCharts 
          timeSeriesData={timeSeriesData.data}
          crmStats={crmStats.data}
          isLoading={timeSeriesData.isLoading || crmStats.isLoading}
        />

        {/* Tables */}
        <AnalyticsTables 
          usersActivity={usersActivity.data}
          recentTournees={recentTournees}
          isLoading={usersActivity.isLoading}
        />
      </div>
    </ScrollArea>
  );
};
