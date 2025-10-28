import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CameraRef,
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
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LobbyRiderCard from "../../components/rideCards/LobbyRiderCard";
import { Ride } from "@/types/ride";
import { useRide } from "@/contexts/RideContext";
import getUserLocation from "@/utils/GetUserLocation";

const StartRide = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { fetchRideById } = useRide();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false); 
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null); // NEW - Route info
  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<CameraRef>(null);
  const userLocation = getUserLocation();

  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

  // Helper function to convert meters to km
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1) + " km";
  };

  // Helper function to convert seconds to minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return minutes + " min";
  };

  // function to fetch the routes using OSRM
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      console.log("Fetching route from:", start, "to:", end);

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
      );

      const data = await response.json();
      console.log("Route response: ", data);

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        console.log(
          "Route found! Distance: ",
          route.distance,
          "meters, Duration:",
          route.duration,
          "seconds"
        );

        // Return both geometry and metadata
        return {
          geometry: route.geometry,
          distance: route.distance, // in meters
          duration: route.duration, // in seconds
        };
      }
      console.log("No routes found");
      return null;
    } catch (error) {
      console.error("Error fetching route: ", error);
      return null;
    }
  };

  // useEffect to get ride details by id
  useEffect(() => {
    if (!id) return;

    const fetchRideDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchRideById(id as string);
        setRide(data);
      } catch (error) {
        console.error("Error fetching ride details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [id]);

  // useeffect to fetch route once user location has been granted
  useEffect(() => {
    // Guard conditions - don't fetch if already loading or have route
    if (!userLocation || isLoadingRoute || routeGeoJSON) {
      console.log("Skipping route fetch:", {
        hasLocation: !!userLocation,
        isLoading: isLoadingRoute,
        hasRoute: !!routeGeoJSON,
      });
      return;
    }

    const destinationCoordinates: [number, number] = [115.7628, -32.1174]; // Coogee
    const userConstantLocation: [number, number] = [115.8569088, -32.0067822];
    console.log("User location available, fetching route...");

    setIsLoadingRoute(true); // Show loading indicator
    const fetchRoute = async () => {

      try {
        const routeData = await getRoute(
          // [userLocation.lon, userLocation.lat],
          userConstantLocation,
          destinationCoordinates
        );

        if (routeData) {
          setRouteGeoJSON(routeData.geometry);
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration,
          });
          console.log("Route saved, ready to draw on map!");

          // camera to show entire route after a short delay
          setTimeout(() => {
            cameraRef.current?.fitBounds(
              [userLocation.lon, userLocation.lat], // Start point
              destinationCoordinates, // End point
              [50, 50, 50, 250], // Padding: [top, right, bottom, left]
              1000 // Animation duration in ms
            );
          }, 500);
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      } finally {
        setIsLoadingRoute(false); // Hide loading indicator
      }
    };

    fetchRoute();
  }, [userLocation]);

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
                centerCoordinate: [115.7628, -32.1174], // Coogee
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
                  coordinates: [115.7628, -32.1174], // Coogee
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
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white rounded-full p-3 shadow-md"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            {/* Destination Card */}
            <View
              className="bg-white flex-row flex-1 ml-4 p-3 rounded-full gap-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Ionicons name="location-outline" size={16} color="black" />
              <Text
                className="text-lg font-semibold text-black"
                numberOfLines={1}
              >
                {ride?.rideDestination || "Destination"}
              </Text>
            </View>
          </View>

          {/* Route Info Card (Distance & Duration) */}
          {routeInfo && !isLoadingRoute && (
            <View
              className="absolute top-20 right-4 bg-white px-4 py-2 rounded-full flex-row items-center gap-3"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center gap-1">
                <Ionicons name="car-outline" size={16} color="#ff6b36" />
                <Text className="text-sm font-semibold text-gray-700">
                  {formatDistance(routeInfo.distance)}
                </Text>
              </View>
              <View className="w-px h-4 bg-gray-300" />
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="#ff6b36" />
                <Text className="text-sm font-semibold text-gray-700">
                  {formatDuration(routeInfo.duration)}
                </Text>
              </View>
            </View>
          )}

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
                <Text className="text-md font-medium text-white">
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
            className="absolute bottom-[22%] z-30 right-4 w-14 h-14 rounded-full bg-orange-600 justify-center items-center shadow-lg"
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
              <Text className="text-2xl font-bold">Ready to Ride?</Text>
              <Text className="text-lg my-4">Riders Status</Text>
              <FlatList
                data={ride?.riders || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <LobbyRiderCard {...item} />}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            </View>

            <TouchableOpacity
              className="p-6 rounded-2xl items-center justify-center mx-6 mt-4"
              style={{ backgroundColor: "#ff6b36" }}
            >
              <Text className="font-semibold text-white">I'm Ready</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-6 rounded-2xl bg-yellow-500 items-center justify-center mx-6 mt-4">
              <Text className="font-semibold text-white">Start Ride</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default StartRide;
