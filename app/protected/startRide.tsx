import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapboxGL from "@rnmapbox/maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LobbyRiderCard from '../../components/LobbyRiderCard';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const startRide = () => {
  const router = useRouter();

  const MAP_BOX_API_KEY = process.env.EXPO_PUBLIC_MAP_BOX_API_KEY;

  if (!MAP_BOX_API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_MAP_BOX_API_KEY in environment variables"
    );
  }

  MapboxGL.setAccessToken(MAP_BOX_API_KEY);

  // Ref for bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  const dummyRiders = [
  {
    id: '1',
    name: 'Alice Johnson',
    estimatedDistance: '2.5 km',
    estimatedTime: '5 min',
  },
  {
    id: '2',
    name: 'Bob Smith',
    estimatedDistance: '4.2 km',
    estimatedTime: '10 min',
  },
  {
    id: '3',
    name: 'Charlie Lee',
    estimatedDistance: '1.8 km',
    estimatedTime: '4 min',
  },
  {
    id: '4',
    name: 'Diana Wang',
    estimatedDistance: '3.0 km',
    estimatedTime: '7 min',
  },
  {
    id: '5',
    name: 'Ethan Brown',
    estimatedDistance: '5.5 km',
    estimatedTime: '12 min',
  },
];


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Map Container */}
        <View className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative">
          <TouchableOpacity onPress={() => {router.back()}} className="absolute top-4 left-4 z-10 bg-gray-400 rounded-full">
      <Ionicons name="arrow-back" size={28} color="white" className="m-4" />
          </TouchableOpacity>
          <MapboxGL.MapView
            style={{ flex: 1 }}
            styleURL={MapboxGL.StyleURL.Street}
          >
            <MapboxGL.Camera
              defaultSettings={{
                centerCoordinate: [115.8613, -31.9523],
                zoomLevel: 10,
              }}
            />
          </MapboxGL.MapView>
        </View>
        <BottomSheet ref={bottomSheetRef} snapPoints={["20%", "50%", "90%"]}>
          <BottomSheetView className="flex-1">
            <View className="p-4">
              <Text className="text-2xl font-bold">Ready to Ride?</Text>
              <Text className="text-lg my-4">Riders Status</Text>
              <FlatList
                data={dummyRiders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <LobbyRiderCard
                    name={item.name}
                    estimatedDistance={item.estimatedDistance}
                    estimatedTime={item.estimatedTime}
                  />
                )}
                 ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // adds space between items
              />
            </View>
            <TouchableOpacity className="p-6 bg-gray-500 rounded-2xl items-center justify-center mx-6 mt-4">
              <Text>I'm ready </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default startRide;
