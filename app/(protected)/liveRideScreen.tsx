import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  CircleLayer,
} from "@maplibre/maplibre-react-native";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { use, useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRide } from "@/contexts/RideContext";
import { Ride } from "@/types/ride";
import { useRoute } from "@/contexts/RouteContext";
import FormatDistance from "@/utils/FormatDistance";
import FormatDuration from "@/utils/FormatDuration";
import { getSocket } from "@/sockets/rideSockets";
import useLiveLocation from "@/utils/UseLiveLocation";
import { useAuth } from "@/contexts/AuthContext";

type RiderLocation = {
  userId: string;
  lat: number;
  lon: number;
};

const liveRideScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;
  const { id } = useLocalSearchParams();
  const { fetchRideById } = useRide();
  const [ride, setRide] = useState<Ride | null>(null);
  const { routeGeoJSON, routeInfo, fetchRoute, cameraRef, userLocation } =
    useRoute();
  const [ridersLocations, setRidersLocations] = useState<
    { userId: string; lat: number; lon: number }[]
  >([]);

  useLiveLocation(ride?._id as string, user?._id as string);

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
  }, [id]);

  useEffect(() => {
    if (!userLocation || !ride || !routeGeoJSON) return;

    const destination: [number, number] = ride.destinationCoords || [
      115.7628, -32.1174,
    ];
    fetchRoute([userLocation.lon, userLocation.lat], destination);
  }, [userLocation, ride]);

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
  }, [routeGeoJSON, userLocation, ride]);

  // Listening to other user's live location
  useEffect(() => {
    const socket = getSocket();

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

    socket.on("updateRiderLocation", handleLocationUpdate);

    //  Clean up when leaving screen
    return () => {
      socket.off("updateRiderLocation", handleLocationUpdate);
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

export default liveRideScreen;
