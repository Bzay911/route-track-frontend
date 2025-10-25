import * as Location from "expo-location";
import { useState, useEffect } from "react";

export default function getUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: currentLocation.coords.latitude,
        lon: currentLocation.coords.longitude,
      });
    })();
  }, []);

  return location;
}
