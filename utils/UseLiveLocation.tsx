import { useEffect } from "react";
import * as Location from "expo-location";
import { getSocket } from "../sockets/rideSockets";

/**
 * useLiveLocation
 * Continuously tracks user location and emits it to socket for a ride session.
 * Automatically cleans up on unmount.
 */
export default function useLiveLocation(rideId: string, userId: string) {
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      try {
        console.log("📍 Requesting location permissions...");
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.error("❌ Location permission denied!");
          return;
        }

        console.log("✅ Permission granted. Starting live location tracking...");

        // Start continuous tracking
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest, // use Balanced for battery saving
            timeInterval: 5000, // update every 5 seconds
            distanceInterval: 0, // or set to e.g., 5 (meters) to reduce updates
          },
          (location) => {
            if (!isMounted) return;

            const { latitude, longitude } = location.coords;
            console.log("📡 Location update:", { latitude, longitude });

            // Emit to socket
            try {
              const socket = getSocket();
              socket.emit("userLocationUpdate", {
                rideId,
                userId,
                lat: latitude,
                lon: longitude,
              });
              console.log("✅ Location sent to socket");
            } catch (socketError) {
              console.error("⚠️ Socket emission failed:", socketError);
            }
          }
        );
      } catch (error) {
        console.error("❌ Error starting location tracking:", error);
      }
    };

    startTracking();

    return () => {
      console.log("🔴 Cleaning up live location watcher...");
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
        locationSubscription = null;
      }
    };
  }, [rideId, userId]);
}
