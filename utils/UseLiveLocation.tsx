import { useEffect } from "react";
import * as Location from "expo-location";
import { getSocket } from "../sockets/rideSockets";

export default function useLiveLocation(rideId: string, userId: string) {
  useEffect(() => {
    let isActive = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const sendLocation = async () => {
        if (!isActive) return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        getSocket().emit("userLocationUpdate", {
          rideId,
          userId,
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });

        // Schedule the next call after 15 seconds
        setTimeout(sendLocation, 15000);
      };

      // Start the first call
      sendLocation();
    };

    startTracking();

    return () => {
      isActive = false; // stop future timeouts on unmount
    };
  }, [rideId]);
}
