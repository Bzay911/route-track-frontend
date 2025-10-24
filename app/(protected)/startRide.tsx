import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Camera, MapView } from "@maplibre/maplibre-react-native";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import LobbyRiderCard from "../../components/rideCards/LobbyRiderCard";

const StartRide = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const MAPTILER_API_KEY = "wcwJKGSwv6WL0HEGTdyN";

  const dummyRiders = [
    { id: "1", name: "Alice Johnson", estimatedDistance: "2.5 km", estimatedTime: "5 min" },
    { id: "2", name: "Bob Smith", estimatedDistance: "4.2 km", estimatedTime: "10 min" },
    { id: "3", name: "Charlie Lee", estimatedDistance: "1.8 km", estimatedTime: "4 min" },
    { id: "4", name: "Diana Wang", estimatedDistance: "3.0 km", estimatedTime: "7 min" },
  ];

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
          >
            <Camera
              defaultSettings={{
                centerCoordinate: [115.8605, -31.9505], // Perth
                zoomLevel: 9,
              }}
            />
          </MapView>

          {/* Back button on top of map */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-5 left-3 z-10 bg-white rounded-full p-2 shadow"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
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
                data={dummyRiders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <LobbyRiderCard {...item} />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            </View>

            <TouchableOpacity
              className="p-6 rounded-2xl items-center justify-center mx-6 mt-4"
              style={{ backgroundColor: "#ff6b36" }}
            >
              <Text className="font-semibold text-white">I'm Ready</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default StartRide;
