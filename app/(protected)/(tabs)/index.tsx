import RideCard from "@/components/rideCards/RideCard";
import { useRide } from "@/contexts/RideContext";
import { Ride } from "@/types/ride";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import hasRideStarted from "@/utils/HasRideStarted";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { rides } = useRide();
  const [modalVisible, setModalVisible] = useState(false);
  const {user} = useAuth();

  // checking if the started time has arrived yet
  const handleRidePress = (ride: Ride) => {
    // if not show alert
    if (!hasRideStarted(ride)) {
      Alert.alert(
        "Ride has not started yet",
        "The scheduled start time hasn't arrived. Do you want to start anyway?",
        [
          { text: "Wait", style: "cancel" },
          {
            text: "Start anyway",
            onPress: () => router.push(`/startRide?id=${ride._id}`),
          },
        ]
      );
    } else {
      // if yes proceed to the lobby
      router.push(`/startRide?id=${ride._id}`);
    }
  };

  // Clone and sort safely
  const sortedRides = [...(rides || [])].sort((a, b) => {
    const dateA = new Date(a.rideDate || 0);
    const dateB = new Date(b.rideDate || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // // Find the next upcoming ride (first future date)
  const now = new Date();
  const nextRide = sortedRides.find((ride) => {
    const rideDate = new Date(ride.rideDate || 0);
    return rideDate > now;
  });

  // // Get remaining upcoming rides (all future dates except the next one)
  const upcomingRides = sortedRides.filter((ride) => {
    const rideDate = new Date(ride.rideDate || 0);

    return rideDate > now && ride._id !== nextRide?._id;
  });
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#1a1f3a" }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ backgroundColor: "#1a1f3a" }}
      >
        <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
          <Text className="text-white text-lg font-semibold">{user?.displayName.charAt(0) || user?.email.charAt(0)}</Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-white/70 text-lg">Welcome</Text>
          <Text className="text-white text-lg font-semibold">{user?.displayName || "User"}</Text>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Next Ride Section */}
        {nextRide ? (
          <View className="mx-6 mt-6">
            <View className="bg-white/10 rounded-2xl p-6 relative">
              {/* Next Ride capsule */}
              <View
                className="absolute top-3 left-4 rounded-full px-3 py-2 items-center justify-center"
                style={{ backgroundColor: "#ff6b36" }}
              >
                <Text className="text-white text-sm">Next Ride</Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-2 mt-9">
                {nextRide.rideName}
              </Text>
              <Text className="text-white/70 text-base">
                {nextRide.rideDescription || "Join us for an amazing ride!"}
              </Text>
              <View className="mb-6 gap-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="white" />
                  <Text className="text-white/70 ml-3">
                    {nextRide.rideDate
                      ? new Date(nextRide.rideDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="white" />
                  <Text className="text-white/70 ml-3">
                    {nextRide.rideTime
                      ? new Date(nextRide.rideTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "TBD"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="white" />
                  <Text className="text-white/70 ml-3">
                    {nextRide.rideDestination}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: "#ff6b36" }}
                className="rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold">View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
           <View className="bg-white/10 mx-6 rounded-2xl p-6 mb-4 border border-white/20">
            <Text className="text-white/70 text-center">No upcoming rides found</Text>
            <Text className="text-white/70 text-center mt-6">Create one or join one to continue !</Text>
          </View>
        )}

        {/* Upcoming Rides Section */}
        <View className="mx-6 mt-8">
          <Text className="text-white text-2xl font-bold mb-6">
            Upcoming Rides
          </Text>
        </View>

        {upcomingRides.length > 0 ? (
          upcomingRides.map((ride) => <RideCard key={ride._id} ride={ride} />)
        ) : (
          <View className="bg-white/10 mx-6 rounded-2xl p-6 mb-4 border border-white/20">
            <Text className="text-white/70 text-center">
              No upcoming rides found
            </Text>
          </View>
        )}

        {/* Modal */}
        <Modal transparent visible={modalVisible} animationType="slide">
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="bg-white rounded-2xl w-4/5 p-5">
              <Text className="text-lg font-bold mb-3">
                Select a ride you want to start
              </Text>

              <FlatList
                data={rides}
                keyExtractor={(ride) => ride._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="py-3 border-b border-gray-200"
                    onPress={() => handleRidePress(item)}
                  >
                    <Text className="text-base">{item.rideName}</Text>
                  </TouchableOpacity>
                )}
              />

              {/* Close button */}
              <Pressable
                className="mt-4 bg-red-500 py-2 rounded-xl"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white text-center font-medium">
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View className="h-20" />
      </ScrollView>

      {rides && rides.length > 0 ? (
        <TouchableOpacity
          // onPress={() => router.push("/(protected)/startRide")}
          onPress={() => setModalVisible(true)}
          className="absolute bottom-6 w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
          style={{ alignSelf: "center" }} // center horizontally
        >
          <Ionicons name="add" size={24} color="#1a1f3a" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => router.push("/(protected)/createRide")}
          className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={24} color="#1a1f3a" />
          {/* <Text className="sr-only">Create Ride</Text> */}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
