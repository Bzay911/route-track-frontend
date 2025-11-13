import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraRef } from "@maplibre/maplibre-react-native";

interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
}

export function useFetchRoute() {
  const [routeGeoJSON, setRouteGeoJSON] = useState<any | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const cameraRef = useRef<CameraRef>(null);

  // Function to fetch route from OSRM API
  // Takes start (user location) and end (destination) coordinates and ride id for caching
  const fetchRoute = async (
    start: [number, number],
    end: [number, number],
    rideId?: string
  ): Promise<RouteInfo | null> => {
    try {
      setIsLoadingRoute(true);
      // Try cache first
      if (rideId) {
        const cacheKey = `route_${rideId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          console.log("Loaded route from cache:", rideId);
          const parsed = JSON.parse(cached);
          setRouteGeoJSON(parsed.routeGeoJSON);
          setRouteInfo(parsed.routeInfo);

          // Fit camera
          setTimeout(() => {
            cameraRef.current?.fitBounds(start, end, [50, 50, 50, 250], 1000);
          }, 500);

          return parsed.routeInfo;
        }
      }

      // Fetch new route
      console.log("No cache found, fetching from OSRM API");
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      );
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const info = { distance: route.distance, duration: route.duration };

        setRouteGeoJSON(route.geometry);
        setRouteInfo(info);

        // Save to AsyncStorage
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
    } catch (err) {
      console.error("Error fetching route:", err);
      return null;
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return {
    routeGeoJSON,
    routeInfo,
    isLoadingRoute,
    cameraRef,
    fetchRoute
  };
}
