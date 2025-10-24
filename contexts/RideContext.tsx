import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "../config/apiConfig";
import { useAuth } from "./AuthContext";
import { Ride } from "../types/ride";


// Define the context value interface
interface RideContextValue {
  rides: Ride[] | null;
  fetchAllRides: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  setRides: React.Dispatch<React.SetStateAction<Ride[] | null>>;
  fetchRideById: (id: string) => Promise<Ride | null>;
}

// Define the provider props interface
interface RideProviderProps {
  children: ReactNode;
}

const RideContext = createContext<RideContextValue | undefined>(undefined);

export const RideProvider = ({ children }: RideProviderProps) => {
  const [rides, setRides] = useState<Ride[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchAllRides();
  }, []);

  const fetchAllRides = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/rides/get-all-rides`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all rides");
      }

      const data = await response.json();
      setRides(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRideById = async (id: string): Promise<Ride | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rides/get-ride/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ride by ID");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching ride by ID:", error);
      return null;
    }
  };

  const contextValue: RideContextValue = {
    rides,
    fetchAllRides,
    isLoading,
    error,
    setRides,
    fetchRideById,
  };

  return (
    <RideContext.Provider value={contextValue}>{children}</RideContext.Provider>
  );
};

export const useRide = (): RideContextValue => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider");
  }
  return context;
};
