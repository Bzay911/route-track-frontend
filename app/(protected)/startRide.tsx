import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  CircleLayer
} from "@maplibre/maplibre-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LobbyRiderCard from "../../components/rideCards/LobbyRiderCard";
import { Ride } from "@/types/ride";
import { useRide } from "@/contexts/RideContext";
import {
  initRideSocket,
  getSocket,
  disconnectSocket,
} from "@/sockets/rideSockets";
import { useAuth } from "@/contexts/AuthContext";
import { useRoute } from "@/contexts/RouteContext";

const StartRide = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { fetchRideById } = useRide();
  const {
    routeGeoJSON,
    routeInfo,
    fetchRoute,
    isLoadingRoute,
    cameraRef,
    userLocation,
    clearRoute,
  } = useRoute();
  const [ride, setRide] = useState<Ride | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  console.log("userloc", userLocation);

  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

  // checking if admin
  const isAdmin = ride?.createdby?.toString() === user?._id;

  const currentRider = ride?.riders?.find((r) => r.user._id === user?._id);
  const isReady = currentRider?.ready;

  // Clear route when component unmounts or ride changes
  useEffect(() => {
    return () => {
      clearRoute();
    };
  }, [id]); // Clear when ride ID changes

  useEffect(() => {
    if (!userLocation || !ride) return;

    const destination: [number, number] = ride.destinationCoords || [
      115.7628, -32.1174,
    ];
    fetchRoute([userLocation.lon, userLocation.lat], destination, ride._id);
  }, [userLocation, ride?._id]);

  // useEffect to get ride details by id
  useEffect(() => {
    if (!id) return;

    const fetchRideDetails = async () => {
      try {
        clearRoute();
        const data = await fetchRideById(id as string);
        setRide(data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
      }
    };

    fetchRideDetails();
  }, [id]);

  // useEffect for socket
  useEffect(() => {
    if (!id) return;
    const socket = initRideSocket(id as string);

    // Listen for updates
    socket.on("updatedRidersStatus", (updatedRiders: any[]) => {
      setRide((prev) => (prev ? { ...prev, riders: updatedRiders } : prev));
    });

    return () => {
      disconnectSocket();
    };
  }, [id]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Map */}
        <View className="flex-1">
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
          </MapView>

          {/* Top Overlay */}
          <View className="absolute top-4 left-0 right-0 px-4 flex-row items-center justify-between">
            {/* Destination Card */}
            <View
              className="bg-white flex-row flex-1 p-3 rounded-lg gap-2 items-center"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Ionicons name="location-outline" size={16} color="black" />

              <View className="flex-1">
                <Text
                  className="text-md font-interRegular text-black"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {ride?.rideDestination || "Destination"}
                </Text>
              </View>

              {/* Close Button stays at end always */}
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close-outline" size={22} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* NEW - Loading Indicator for route fetching */}
          {isLoadingRoute && (
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
                  Calculating route...
                </Text>
              </View>
            </View>
          )}

          {/* floating locate button */}
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
            className="absolute bottom-[22%] right-4 w-14 h-14 rounded-full bg-violet-600 justify-center items-center shadow-lg"
          >
            <Ionicons name="locate" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={["20%", "50%", "90%"]}
          enablePanDownToClose={false}
        >
          <BottomSheetView className="flex-1">
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-interBold">
                    Ready to Ride?
                  </Text>
                  <Text className="text-lg my-4 font-interMedium">
                    Riders Status
                  </Text>
                </View>

                <TouchableOpacity
                  className="py-6 px-4 rounded-2xl items-center justify-center mb-4"
                  onPress={() =>
                    router.push(`/(protected)/liveRideScreen?id=${ride?._id}`)
                  }
                >
                  <Text className="font-interMedium">Start Ride</Text>
                </TouchableOpacity>
                {/* {isAdmin && (
                  <TouchableOpacity
                    className="py-6 px-4 rounded-2xl items-center justify-center mb-4"
                    style={{
                      backgroundColor:
                        isAdmin && routeGeoJSON ? "#22c55e" : "#94a3b8", // green if ready, gray if disabled
                    }}
                    disabled={!isAdmin || !routeGeoJSON} // disable button if not admin or route not ready
                    onPress={() =>
                      router.push(`/(protected)/liveRideScreen?id=${ride?._id}`)
                    }
                  >
                    <Text className="font-interMedium text-white">Start Ride</Text>
                  </TouchableOpacity>
                )} */}
              </View>
              <FlatList
                data={ride?.riders || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <LobbyRiderCard {...item} />}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            </View>

            <TouchableOpacity
              className="p-4 rounded-2xl items-center justify-center mx-4 mt-4"
              style={{
                backgroundColor: isReady ? "#EF4444" : "#22c55e",
              }}
              onPress={() => {
                const socket = getSocket();

                if (currentRider?.ready) {
                  console.log("making them not ready");
                  socket.emit("riderNotReady", {
                    rideId: ride?._id,
                    userId: user?._id,
                  });
                } else {
                  socket.emit("riderReady", {
                    rideId: ride?._id,
                    userId: user?._id,
                  });
                }
              }}
            >
              <Text className="font-interRegular text-white">
                {isReady ? "Not ready " : " I'm Ready"}
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default StartRide;
