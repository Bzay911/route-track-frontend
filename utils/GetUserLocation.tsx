// utils/useUserLocation.ts
import * as Location from "expo-location";
import { useState, useEffect } from "react";

export default function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          lat: currentLocation.coords.latitude,
          lon: currentLocation.coords.longitude,
        });
      } catch (error: any) {
        console.error("Location error:", error);
        setErrorMsg("Current location is unavailable. Enable location services.");
      }
    })();
  }, []);

  return { location, errorMsg };
}
