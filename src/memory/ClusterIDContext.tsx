import {
  createContext,
  useState,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

interface ClusterContextType {
  currentClusterID: string | null;
  setCurrentClusterID: (id: string) => void;
}

const ClusterIDContext = createContext<ClusterContextType | undefined>(
  undefined,
);

interface ClusterIDProviderProps {
  children: ReactNode;
}

export const ClusterIDProvider = ({ children }: ClusterIDProviderProps) => {
  const [clusterID, setClusterID] = useState<string | null>(null);

  const contextValue = useMemo(
    () => ({
      currentClusterID: clusterID,
      setCurrentClusterID: setClusterID,
    }),
    [clusterID],
  );

  return (
    <ClusterIDContext.Provider value={contextValue}>
      {children}
    </ClusterIDContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useClusterID = () => {
  const context = useContext(ClusterIDContext);

  if (context === undefined) {
    throw new Error("useClusterID must be used within a ClusterIDProvider");
  }

  return context;
};
