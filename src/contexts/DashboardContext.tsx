import { createContext, useContext, useState, ReactNode } from 'react';

export type DashboardView = 'prospects' | 'tournees' | 'crm' | 'analytics';

interface DashboardContextType {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  selectedEntreprise: any | null;
  setSelectedEntreprise: (entreprise: any | null) => void;
  crmPanelOpen: boolean;
  setCrmPanelOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<DashboardView>('prospects');
  const [selectedEntreprise, setSelectedEntreprise] = useState<any | null>(null);
  const [crmPanelOpen, setCrmPanelOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        view,
        setView,
        selectedEntreprise,
        setSelectedEntreprise,
        crmPanelOpen,
        setCrmPanelOpen
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
