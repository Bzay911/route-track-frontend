import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  CircleLayer,
} from "@maplibre/maplibre-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  AppState,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LobbyRiderCard from "../../components/rideCards/LobbyRiderCard";
import { Ride } from "@/types/ride";
import { useRide } from "@/contexts/RideContext";
// import {
//   InitRideSocket,
//   getSocket,
//   disconnectSocket,
// } from "@/sockets/rideSockets";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/contexts/AuthContext";
import PulseAnimation from "@/components/animations/PulseAnimation";
import hasRideStarted from "@/utils/HasRideStarted";
import { useFetchRoute } from "@/hooks/customHooks/UseFetchRoute";
import { useSocket } from "@/contexts/SocketContext";
import useUserLiveLocation from "@/hooks/customHooks/useUserLiveLocation";

const StartRide = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // contexts and hooks
  const { user } = useAuth();
  const { fetchRideById } = useRide();
  const { routeGeoJSON, routeInfo, fetchRoute, isLoadingRoute, cameraRef } =
    useFetchRoute();
  const { socket } = useSocket();
  const { userLocation, locationError, isLoadingLocation } =
    useUserLiveLocation();

  // states and refs
  const [ride, setRide] = useState<Ride | null>(null);
  const [rideCanBeStarted, setRideCanBeStarted] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [adminStartedRide, setAdminStartedRide] = useState(false);

  // ref to track app state (active on first load)
  const appState = useRef(AppState.currentState);
  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

  // checking if admin
  const isAdmin = ride?.createdby?.toString() === user?._id;
  const currentRider = ride?.riders?.find((r) => r.user._id === user?._id);
  const isReady = currentRider?.ready;

  // useEffect to fetch route when userLocation or ride changes
  useEffect(() => {
    if (!userLocation || !ride) return;
    const destination: [number, number] = ride.destinationCoords || [
      115.7628, -32.1174,
    ];
    fetchRoute([userLocation.lon, userLocation.lat], destination, ride._id);
  }, [userLocation, ride]);

  // useEffect to get ride details by id and setting it to ride state
  useEffect(() => {
    if (!id) return;
    const fetchRideDetails = async () => {
      try {
        // clearRoute();
        const data = await fetchRideById(id as string);
        setRide(data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
      }
    };
    fetchRideDetails();
  }, [id, fetchRideById]);

  // useEffect to initialize socket and join ride room
  useEffect(() => {
    if (!socket || !ride?._id || !user?._id) return;

    socket.emit("joinRide", { rideId: ride._id });

    // return () => {
    //   // leave room when leaving lobby
    //   if (socket && ride?._id && user?._id) {
    //     socket.emit("leaveRide", { rideId: ride._id, userId: user._id });
    //   }
    // };
  }, [ride?._id, user?._id, socket]);

  // useEffect to setup socket listeners for ride updates
  useEffect(() => {
  if (!socket) {
    return;
  }
  
  const handleRidersUpdate = (updatedRiders: any) => {
    setRide((prev) => (prev ? { ...prev, riders: [...updatedRiders] } : prev));
  };

  const handleAdminStarted = () => {
    setAdminStartedRide(true);
    setRideCanBeStarted(true);
  };

  socket.on("updatedRidersStatus", handleRidersUpdate);
  socket.on("rideStartedByAdmin", handleAdminStarted);
  
  return () => {
    socket.off("updatedRidersStatus", handleRidersUpdate);
    socket.off("rideStartedByAdmin", handleAdminStarted);
  };
}, [socket]);

  // checking if ride can be started
  useEffect(() => {
    if (!ride) return;
    if (hasRideStarted(ride)) {
      setRideCanBeStarted(true);
    } else {
      setRideCanBeStarted(false);
    }
  }, [ride]);

  // Listen for app state changes (when user returns from Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // If app comes to foreground from background
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground - rechecking location");
        // if error we are directing user to start ride screen again to recheck permissions
        if (locationError) {
          router.replace(`/(protected)/StartRide?id=${id}`);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [locationError, id]);

  const handleGoBtnPress = (ride: Ride) => {
    if (!hasRideStarted(ride)) {
      Alert.alert(
        "Ride has not started yet",
        "The scheduled start time hasn't arrived. Do you want to start anyway?",
        [
          { text: "Wait", style: "cancel" },
          {
            text: "Start anyway",
            onPress: () => {
              // const socket = getSocket();
              router.push(`/(protected)/LiveRideScreen?id=${ride?._id}`);
              socket?.emit("adminStartedTheRide", { rideId: ride._id });
            },
          },
        ]
      );
    } else {
      // if yes proceed to the live ride screen
      router.push(`/(protected)/LiveRideScreen?id=${ride?._id}`);
    }
  };

  // checking if all riders are ready
  const handleRidersCheck = (ride: Ride) => {
    return ride.riders.every((rider) => rider.ready);
  };

  // If location error
  // In your error screen JSX:
  if (locationError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-4">
        <MaterialIcons name="location-off" size={64} color="#EF4444" />
        <Text className="text-xl font-interBold text-center mt-4">
          Location Access Required !
        </Text>
        <Text className="text-md font-interRegular text-center mt-2 text-gray-600">
          {locationError}
        </Text>

        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            className="bg-orange-500 px-6 py-3 rounded-lg"
            onPress={() => Linking.openSettings()}
          >
            <Text className="text-white font-interMedium">Go to Settings</Text>
          </TouchableOpacity>

          {/* NEW: Retry Button */}
          <TouchableOpacity
            className="bg-green-500 px-6 py-3 rounded-lg"
            onPress={() => {
              console.log("Retry button pressed");
              router.replace(`/(protected)/StartRide?id=${id}`);
            }}
          >
            <Text className="text-white font-interMedium">Retry</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-gray-600 font-interRegular underline">
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
                <Ionicons name="close-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* NEW - Loading Indicator for route fetching */}
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

          {/* Start ride button */}
          {/* Checking if ride can be started, if time has arrived show green button else gray button  */}
          {rideCanBeStarted ? (
            // ride can be started, displaying green pulse button
            <View className="absolute bottom-[24%] left-[50%] translate-x-[-50%] items-center justify-center">
              <PulseAnimation size={80} color="rgba(34, 197, 94, 0.3)" />
              <TouchableOpacity
                className="p-6 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: "#22c55e" }}
                onPress={() => {
                  if (!ride) return;
                  handleGoBtnPress(ride);
                }}
              >
                <Text className="text-2xl font-interMedium text-white">Go</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="absolute bottom-[24%] left-[50%] translate-x-[-50%] items-center justify-center">
              <TouchableOpacity
                className="p-6 rounded-full items-center justify-center shadow-lg bg-gray-400"
                onPress={() => {
                  if (!ride) return;
                  if (isAdmin) {
                    if (handleRidersCheck(ride)) {
                      handleGoBtnPress(ride);
                    } else {
                      Alert.alert(
                        "Not all riders are ready",
                        "Please ensure all riders are marked as ready before starting the ride.",
                        [
                          { text: "OK", style: "cancel" },
                          {
                            text: "Start anyway",
                            onPress: () => handleGoBtnPress(ride),
                          },
                        ]
                      );
                    }
                  } else {
                    Alert.alert(
                      "Admin has not started yet",
                      "Please wait for the admin to start the ride.",
                      [{ text: "OK", style: "cancel" }]
                    );
                  }
                }}
              >
                <Text className="text-2xl font-interMedium text-white">Go</Text>
              </TouchableOpacity>
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
            className="absolute bottom-[22%] right-4 p-3 rounded-full bg-black justify-center items-center shadow-lg"
          >
            <Ionicons name="locate" size={22} color="white" />
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
              </View>
              <FlatList
                data={ride?.riders || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <LobbyRiderCard rider={item} routeInfo={routeInfo} />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            </View>

            <TouchableOpacity
              className="p-4 rounded-2xl items-center justify-center mx-4 mt-4"
              style={{
                backgroundColor: isReady ? "#EF4444" : "#22c55e",
              }}
              onPress={() => {
                // const socket = getSocket();

                if (currentRider?.ready) {
                  console.log("making them not ready");
                  socket?.emit("riderNotReady", {
                    rideId: ride?._id,
                    userId: user?._id,
                  });
                } else {
                  socket?.emit("riderReady", {
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
