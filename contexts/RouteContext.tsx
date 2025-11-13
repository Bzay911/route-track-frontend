import { useContext, createContext, useState } from "react";

interface RouteContextType {
  userLocation: { lat: number; lon: number } | null;
  setUserLocation: React.Dispatch<React.SetStateAction<{ lat: number; lon: number } | null>>;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);



export const RouteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  return (
    <RouteContext.Provider
      value={{
    
        userLocation,
        setUserLocation,
       
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

// --- Custom hook to use RouteContext ---
export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) throw new Error("useRoute must be used within a RouteProvider");
  return context;
};
