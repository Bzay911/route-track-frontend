import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  CircleLayer,
} from "@maplibre/maplibre-react-native";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRide } from "@/contexts/RideContext";
import { Ride } from "@/types/ride";
import FormatDistance from "@/utils/FormatDistance";
import FormatDuration from "@/utils/FormatDuration";
import { useFetchRoute } from "@/hooks/customHooks/UseFetchRoute";
import useUserLiveLocation from "@/hooks/customHooks/useUserLiveLocation";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";

type RiderLocation = {
  userId: string;
  lat: number;
  lon: number;
};

type RiderNotification = {
  type: "joined" | "left";
  displayName: string;
};

const LiveRideScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // contexts and hooks
  const { fetchRideById } = useRide();
  const { routeGeoJSON, routeInfo, fetchRoute, cameraRef, isLoadingRoute } =
    useFetchRoute();
  const { userLocation, isLoadingLocation } = useUserLiveLocation();
  const { user } = useAuth();
  const { socket } = useSocket();

  // states
  const [ride, setRide] = useState<Ride | null>(null);
  const [ridersLocations, setRidersLocations] = useState<
    { userId: string; lat: number; lon: number }[]
  >([]);
  const [riderNotifications, setRiderNotifications] = useState<
    RiderNotification[]
  >([]);
  const [currentNotification, setCurrentNotification] =
    useState<RiderNotification | null>(null);
  const isProcessingRef = useRef(false);

  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

  // Emitting the userJoined event when user comes to live ride screen
  useEffect(() => {
    if (!ride || !user) return;

    socket?.emit("userJoined", {
      rideId: ride._id,
      displayName: user.displayName,
    });

    // Clean up when leaving screen
    return () => {
      socket?.emit("userLeft", {
        rideId: ride._id,
        displayName: user.displayName,
      });
      console.log("✅ User left event emitted to socket");
    };
  }, [ride, user]);

  // Process queue - show one notification at a time
  useEffect(() => {
    if (isProcessingRef.current || riderNotifications.length === 0) return;

    isProcessingRef.current = true;
    const nextNotification = riderNotifications[0];

    // Show the notification
    setCurrentNotification(nextNotification);

    // Remove from queue and clear display after 2 seconds
    setTimeout(() => {
      setCurrentNotification(null);
      setRiderNotifications((prev) => prev.slice(1)); // Remove first item
      isProcessingRef.current = false;
    }, 2000);
  }, [riderNotifications]);

  // listening to the join/leave events
  useEffect(() => {
    if (!socket) return;

    const handleRiderJoined = (rider: { displayName: string }) => {
      // Add to queue
      setRiderNotifications((prev) => [
        ...prev,
        { type: "joined", displayName: rider.displayName },
      ]);
    };

    const handleRiderLeft = (rider: { displayName: string }) => {
      // Add to queue
      setRiderNotifications((prev) => [
        ...prev,
        { type: "left", displayName: rider.displayName },
      ]);
    };

    socket.on("riderJoined", handleRiderJoined);
    socket.on("riderLeft", handleRiderLeft);

    return () => {
      socket.off("riderJoined", handleRiderJoined);
      socket.off("riderLeft", handleRiderLeft);
    };
  }, [socket]);

  // Fetching ride details for live ride screen based on ride id
  useEffect(() => {
    if (!id) return;
    const fetchRideDetails = async () => {
      try {
        const data = await fetchRideById(id as string);
        setRide(data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
      }
    };

    fetchRideDetails();
  }, [id, fetchRideById]);

  // Fetching route when user location or ride destination changes
  useEffect(() => {
    if (!userLocation || !ride) return;
    const destination: [number, number] = ride.destinationCoords || [
      115.7628, -32.1174,
    ];
    fetchRoute([userLocation.lon, userLocation.lat], destination, ride._id);
  }, [userLocation, ride]);

  // Fitting map bounds to show both user location and destination
  useEffect(() => {
    if (routeGeoJSON && userLocation && ride?.destinationCoords) {
      // Ensure the camera ref is ready
      setTimeout(() => {
        cameraRef.current?.fitBounds(
          [userLocation.lon, userLocation.lat],
          ride.destinationCoords,
          [30, 30, 30, 30],
          1000
        );
      }, 500);
    }
  }, [routeGeoJSON, userLocation, ride, cameraRef]);

  // Emit user location to socket whenever it updates
  useEffect(() => {
    if (!userLocation || !ride?._id || !user?._id) return;

    socket?.emit("userLocationUpdate", {
      rideId: ride._id,
      userId: user._id,
      lat: userLocation.lat,
      lon: userLocation.lon,
    });

    console.log("✅ My location sent to socket");
  }, [userLocation, ride?._id, user?._id]);

  // Listening to other user's live location
  useEffect(() => {
    // setting new incoming location updates from other riders
    const handleLocationUpdate = ({ userId, lat, lon }: RiderLocation) => {
      setRidersLocations((prev) => {
        const existing = prev.find((r) => r.userId === userId);
        if (existing) {
          return prev.map((r) =>
            r.userId === userId ? { ...r, lat, lon } : r
          );
        }
        return [...prev, { userId, lat, lon }];
      });
    };

    // listening to location updates from backend socket (handleLocationUpdate)
    socket?.on("updateRiderLocation", handleLocationUpdate);

    //  Clean up when leaving screen
    return () => {
      socket?.off("updateRiderLocation", handleLocationUpdate);
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Map */}
      <View className="flex-1 relative">
        <MapView
          style={{ flex: 1 }}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`}
          scrollEnabled
          rotateEnabled
          pitchEnabled
          zoomEnabled
          compassEnabled={false}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: ride?.destinationCoords,
              zoomLevel: 12,
            }}
          />

          {/* Drawing route line on the map */}
          {routeGeoJSON && (
            <ShapeSource id="routeSource" shape={routeGeoJSON}>
              <LineLayer
                id="routeLine"
                style={{
                  lineColor: "#4285F4",
                  lineWidth: 5,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </ShapeSource>
          )}

          {/* NEW - User Location Marker (Blue dot) */}
          {userLocation && (
            <ShapeSource
              id="userLocationSource"
              shape={{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [userLocation.lon, userLocation.lat],
                },
                properties: {},
              }}
            >
              {/* Outer pulse circle */}
              <CircleLayer
                id="userLocationPulse"
                style={{
                  circleRadius: 20,
                  circleColor: "#4A90E2",
                  circleOpacity: 0.2,
                }}
              />
              {/* Inner solid circle */}
              <CircleLayer
                id="userLocationDot"
                style={{
                  circleRadius: 8,
                  circleColor: "#4A90E2",
                  circleStrokeColor: "#FFFFFF",
                  circleStrokeWidth: 3,
                }}
              />
            </ShapeSource>
          )}

          {/* NEW - Destination Marker (Orange dot) */}
          <ShapeSource
            id="destinationSource"
            shape={{
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: ride?.destinationCoords || [115.7628, -32.1174], // else fallback to coogee
              },
              properties: {},
            }}
          >
            <CircleLayer
              id="destinationMarker"
              style={{
                circleRadius: 12,
                circleColor: "#ff6b36",
                circleStrokeColor: "#FFFFFF",
                circleStrokeWidth: 3,
              }}
            />
          </ShapeSource>

          {/* Other riders live location marker */}
          {ridersLocations.map((rider) => (
            <ShapeSource
              key={rider.userId}
              id={`rider-${rider.userId}`}
              shape={{
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [rider.lon, rider.lat],
                },
                properties: {},
              }}
            >
              {/* Outer pulse circle */}
              <CircleLayer
                id={`riderPulse-${rider.userId}`}
                style={{
                  circleRadius: 20,
                  circleColor: "#FF0000", // red outer circle
                  circleOpacity: 0.2,
                }}
              />
              {/* Inner solid circle */}
              <CircleLayer
                id={`riderDot-${rider.userId}`}
                style={{
                  circleRadius: 8,
                  circleColor: "#FF0000", // red inner circle
                  circleStrokeColor: "#FFFFFF",
                  circleStrokeWidth: 3,
                }}
              />
            </ShapeSource>
          ))}
        </MapView>

        {/* Top Overlay */}
        <View className="absolute top-4 left-0 right-0 px-4 flex-row items-center justify-between">
          {/* Destination Card */}
          <View
            className="bg-white flex-row flex-1 mx-2 p-3 rounded-lg items-center gap-2"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 5,
            }}
          >
            <Ionicons name="location-outline" size={16} color="black" />
            <Text
              className="text-md font-interRegular  text-black"
              numberOfLines={2}
            >
              {ride?.rideDestination || "Destination"}
            </Text>
          </View>
        </View>

        {/* Displaying loading states */}
        {(isLoadingRoute || isLoadingLocation) && (
          <View className="absolute inset-0 justify-center items-center">
            <View
              className="bg-black h-[100px] px-4 py-3 rounded-xl flex-col justify-center items-center gap-2"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <ActivityIndicator size="small" color="#ff6b36" />
              <Text className="text-md font-interMedium text-white">
                {isLoadingLocation
                  ? "Getting your location..."
                  : "Calculating route..."}
              </Text>
            </View>
          </View>
        )}

        {currentNotification && (
          <View
            className={`absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 flex-row items-center justify-center rounded-md ${
              currentNotification.type === "joined"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            <Text className="text-white font-interMedium">
              {currentNotification.displayName}{" "}
              {currentNotification.type === "joined" ? "Joined" : "Left"}!
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            if (userLocation) {
              cameraRef.current?.setCamera({
                centerCoordinate: [userLocation.lon, userLocation.lat],
                zoomLevel: 14,
                animationDuration: 1000,
                animationMode: "flyTo",
              });
            }
          }}
          className=" flex-row absolute bottom-[5%] z-30 rounded-xl right-4 h-14 gap-2 bg-white justify-around items-center shadow-lg p-2"
        >
          <Ionicons name="navigate-outline" size={18} color="green" />
          <Text className="font-interMedium">Re-center</Text>
        </TouchableOpacity>
      </View>

      <View className="h-[100px] bg-white flex-row items-center justify-between px-4">
        <TouchableOpacity
          className="bg-white border border-gray-500 rounded-full p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={32} color={"gray"} />
        </TouchableOpacity>

        <View className="flex-col justify-center">
          <View className="flex-row items-center gap-2">
            <Ionicons name="car-outline" size={26} color="#ff6b36" />
            <Text className="text-green-600 font-interMedium text-[24px] leading-none">
              {FormatDuration(routeInfo?.duration ?? 0)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={20} color="#ff6b36" />
            <Text className="text-gray-500 font-interMedium text-[16px] leading-none mt-1">
              {" "}
              {FormatDistance(routeInfo?.distance ?? 0)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-white border border-gray-500 rounded-full p-4"
          onPress={() => {
            if (ride && userLocation) {
              cameraRef.current?.fitBounds(
                [userLocation.lon, userLocation.lat],
                ride.destinationCoords,
                [30, 30, 30, 30],
                1000
              );
            }
          }}
        >
          <Ionicons name="map-outline" size={22} color={"gray"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LiveRideScreen;
