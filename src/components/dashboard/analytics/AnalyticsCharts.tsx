import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { TimeSeriesData, CRMStats } from "@/hooks/useAdminAnalytics";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface AnalyticsChartsProps {
  timeSeriesData?: TimeSeriesData[];
  crmStats?: CRMStats;
  isLoading: boolean;
}

const chartConfig = {
  tournees: {
    label: "Tournées",
    color: "hsl(var(--accent))",
  },
  km: {
    label: "Kilomètres",
    color: "hsl(210, 100%, 50%)",
  },
  leads: {
    label: "Leads",
    color: "hsl(142, 76%, 36%)",
  },
  interactions: {
    label: "Interactions",
    color: "hsl(280, 100%, 50%)",
  },
};

const statusLabels: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  interesse: "Intéressé",
  proposition: "Proposition",
  negociation: "Négociation",
  gagne: "Gagné",
  perdu: "Perdu",
  en_attente: "En attente",
};

const statusColors: Record<string, string> = {
  nouveau: "hsl(210, 100%, 50%)",
  contacte: "hsl(45, 100%, 50%)",
  interesse: "hsl(142, 76%, 36%)",
  proposition: "hsl(280, 100%, 50%)",
  negociation: "hsl(32, 100%, 50%)",
  gagne: "hsl(142, 76%, 36%)",
  perdu: "hsl(0, 84%, 60%)",
  en_attente: "hsl(210, 14%, 53%)",
};

export const AnalyticsCharts = ({ 
  timeSeriesData, 
  crmStats,
  isLoading 
}: AnalyticsChartsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare status data for pie chart
  const statusData = Object.entries(crmStats?.byStatus || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    fill: statusColors[status] || "hsl(210, 14%, 53%)",
  }));

  // Prepare interaction types data
  const interactionData = Object.entries(crmStats?.interactionsByType || {}).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  // Format time series data
  const formattedTimeSeriesData = (timeSeriesData || []).map(d => ({
    ...d,
    dateFormatted: format(parseISO(d.date), 'dd/MM', { locale: fr }),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Évolution des tournées et km */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tournées et kilomètres (30 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={formattedTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="tournees"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.3}
                name="Tournées"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="km"
                stroke="hsl(210, 100%, 50%)"
                fill="hsl(210, 100%, 50%)"
                fillOpacity={0.2}
                name="Km"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Évolution leads et interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads et interactions (30 jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={formattedTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={false}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="interactions"
                stroke="hsl(280, 100%, 50%)"
                strokeWidth={2}
                dot={false}
                name="Interactions"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Répartition par statut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition des leads par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Types d'interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Types d'interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={interactionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--accent))" 
                radius={[0, 4, 4, 0]}
                name="Nombre"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
