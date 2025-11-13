import { useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationCoords {
  lat: number;
  lon: number;
}

export default function useUserLiveLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      try {
        console.log("Requesting location permissions...");
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.error("Location permission denied!");
          setError("Location permission denied");
          setIsLoading(false);
          return;
        }

        console.log("Permission granted.");

        // 1. Get initial location immediately
        try {
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          if (isMounted) {
            const { latitude, longitude } = initialLocation.coords;
            console.log("Initial location:", { latitude, longitude });
            setLocation({ lat: latitude, lon: longitude });
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Could not get initial location:", err);
          setError("Could not get initial location");
          setIsLoading(false);
        }

        // 2. Start continuous tracking
        console.log("Starting continuous location tracking...");
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // update every 5 seconds
            distanceInterval: 10, // or update when moved 10 meters
          },
          (newLocation) => {
            if (!isMounted) return;

            const { latitude, longitude } = newLocation.coords;
            console.log("Location update:", { latitude, longitude });
            setLocation({ lat: latitude, lon: longitude });
          }
        );
      } catch (err) {
        console.error("Error starting location tracking:", err);
        setError("Failed to start location tracking");
        setIsLoading(false);
      }
    };

    startTracking();

    return () => {
      console.log("Cleaning up location tracker...");
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return { userLocation : location, error, isLoading };
}