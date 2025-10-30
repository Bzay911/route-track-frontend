import { Ionicons } from "@expo/vector-icons";
import { Camera, MapView, CameraRef } from "@maplibre/maplibre-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";
import { useRouter } from "expo-router";

const liveRideScreen = () => {
      const cameraRef = useRef<CameraRef>(null);
      const router = useRouter();
        const MAPTILER_API_KEY = process.env.EXPO_PUBLIC_MAP_API_KEY;

  return (
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
        </MapView>

        {/* Top Overlay */}
        <View className="absolute top-4 left-0 right-0 px-4 flex-row items-center justify-between">
          
          {/* Destination Card */}
          <View
            className="bg-white flex-row flex-1 mx-2 p-3 rounded-full items-center"
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
              Destination
              {/* {ride?.rideDestination || "Destination"} */}
            </Text>
          </View>
        </View>

        {/* floating locate button */}
        {/* <TouchableOpacity
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
          </TouchableOpacity> */}
      </View>

<View className="h-[100px] bg-white flex-row items-center justify-between px-4">
 <View className="flex-col justify-center">
    <Text className="text-green-600 font-semibold text-[28px] leading-none">14 min</Text>
    <Text className="text-gray-500 text-lg leading-none mt-1">11 km</Text>
  </View>

  <TouchableOpacity className="bg-red-500 rounded-lg px-6 py-4" onPress={() => router.back()}>
    <Text className="text-white text-lg">Exit</Text>
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
};

export default liveRideScreen;
