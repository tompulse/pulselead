import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  view: 'prospects' | 'tournees';
  setView: (view: 'prospects' | 'tournees') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<'prospects' | 'tournees'>('prospects');

  return (
    <DashboardContext.Provider
      value={{
        view,
        setView
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
