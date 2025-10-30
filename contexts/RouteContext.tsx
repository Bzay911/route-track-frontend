import { useContext, createContext, useState, useEffect, useRef } from "react";
import { Ride } from "@/types/ride";
import { CameraRef } from "@maplibre/maplibre-react-native";
import useUserLocation from "../utils/GetUserLocation";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
}

interface RouteContextType {
  ride: Ride | null;
  setRide: React.Dispatch<React.SetStateAction<Ride | null>>;
  routeGeoJSON: any | null;
  routeInfo: RouteInfo | null;
  isLoadingRoute: boolean;
  cameraRef: React.RefObject<CameraRef | null>;
  fetchRoute: (
    start: [number, number],
    end: [number, number],
    rideId?: string
  ) => Promise<RouteInfo | null>;
  userLocation: { lat: number; lon: number } | null;
  clearRoute: () => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ride, setRide] = useState<Ride | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const { location: userLocation, errorMsg } = useUserLocation();

  const cameraRef = useRef<CameraRef>(null);

  // Function to clear saved routes
  const clearRoute = () => {
    setRouteGeoJSON(null);
    setRouteInfo(null);
  }

  // --- Function to fetch route from OSRM ---
  const fetchRoute = async (
    start: [number, number],
    end: [number, number],
    rideId?: string
  ): Promise<RouteInfo | null> => {
    try {
      setIsLoadingRoute(true);
      clearRoute();

      //  Try to load from AsyncStorage first
      if(rideId){
        const cacheKey = `route_${rideId}`;
        const cachedRoute = await AsyncStorage.getItem(cacheKey);
        if (cachedRoute) {
          console.log("Loaded route from cache for ride:", rideId);
          const parsed = JSON.parse(cachedRoute);
          setRouteGeoJSON(parsed.routeGeoJSON);
          setRouteInfo(parsed.routeInfo);

           setTimeout(() => {
            cameraRef.current?.fitBounds(start, end, [50, 50, 50, 250], 1000);
          }, 500);

          return parsed.routeInfo;
        }
      }

      // If not cached, fetch from OSRM
      console.log("No any stored data found!, fetching the api");
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const info = { distance: route.distance, duration: route.duration };

        setRouteGeoJSON(route.geometry);
        setRouteInfo(info);

        // store it locally
          if (rideId) {
          const cacheKey = `route_${rideId}`;
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ routeGeoJSON: route.geometry, routeInfo: info })
          );
        }

        // Fit camera
        setTimeout(() => {
          cameraRef.current?.fitBounds(start, end, [50, 50, 50, 250], 1000);
        }, 500);

        return info;
      }

      return null;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <RouteContext.Provider
      value={{
        ride,
        setRide,
        routeGeoJSON,
        routeInfo,
        isLoadingRoute,
        cameraRef,
        fetchRoute,
        userLocation,
        clearRoute
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
