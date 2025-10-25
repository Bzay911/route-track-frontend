import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { CameraRef, Camera, MapView } from "@maplibre/maplibre-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const Coogee_lat = "-32.1174";
  const Coogee_lon = "115.7628";
  const userLocation = getUserLocation();
  const cameraRef = useRef<CameraRef>(null);

  const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

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
                // centerCoordinate: [115.8605, -31.9505], // Perth
                centerCoordinate: [138.6007, -34.9285], // adelaide
                zoomLevel: 9,
              }}
            />
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

          {/* floating buttons */}
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
