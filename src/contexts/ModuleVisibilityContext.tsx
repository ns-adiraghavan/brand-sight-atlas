import { createContext, useContext, useState, ReactNode } from "react";

interface ModuleVisibilityContextType {
  showComingSoon: boolean;
  setShowComingSoon: (v: boolean) => void;
}

const ModuleVisibilityContext = createContext<ModuleVisibilityContextType>({
  showComingSoon: false,
  setShowComingSoon: () => {},
});

export function ModuleVisibilityProvider({ children }: { children: ReactNode }) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  return (
    <ModuleVisibilityContext.Provider value={{ showComingSoon, setShowComingSoon }}>
      {children}
    </ModuleVisibilityContext.Provider>
  );
}

export const useModuleVisibility = () => useContext(ModuleVisibilityContext);
