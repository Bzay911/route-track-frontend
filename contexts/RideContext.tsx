import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from "../config/apiConfig";

// Define the Ride interface
interface Ride {
  id: string;
  rideName: string;
  rideDescription?: string;
  rideDestination: string;
  rideDate?: string;
  startTime: string;
  participants?: string[];
  createdBy?: string;
  createdAt: string;
}

// Define the context value interface
interface RideContextValue {
  rides: Ride[] | null;
  fetchAllRides: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Define the provider props interface
interface RideProviderProps {
  children: ReactNode;
}

const RideContext = createContext<RideContextValue | undefined>(undefined);

export const RideProvider = ({children}: RideProviderProps) => {
    const [rides, setRides] = useState<Ride[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAllRides()
    }, [])

    const fetchAllRides = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/api/rides/get-all-rides`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if(!response.ok){
                throw new Error("Failed to fetch all rides");
            }
            
            const data = await response.json();
            setRides(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setRides([]);
        } finally {
            setIsLoading(false);
        }
    }

    const contextValue: RideContextValue = {
        rides,
        fetchAllRides,
        isLoading,
        error
    };

    return(
        <RideContext.Provider value={contextValue}>
            {children}
        </RideContext.Provider>
    );
}

export const useRide = (): RideContextValue => {
    const context = useContext(RideContext);
    if (context === undefined) {
        throw new Error('useRide must be used within a RideProvider');
    }
    return context;
};