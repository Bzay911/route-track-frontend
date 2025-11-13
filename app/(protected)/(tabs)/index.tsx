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
import { useAuth } from "@/contexts/AuthContext";
import hasRideStarted from "@/utils/HasRideStarted";
import PulseAnimation from "@/components/animations/PulseAnimation";

export default function HomeScreen() {
  const router = useRouter();

  // Contexts
  const { rides } = useRide();
  const { user } = useAuth();
  
  // States
  const [modalVisible, setModalVisible] = useState(false);
  
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
            onPress: () => router.push(`/StartRide?id=${ride._id}`),
          },
        ]
      );
    } else {
      // if yes proceed to the lobby
      router.push(`/StartRide?id=${ride._id}`);
    }
  };

  const handleNextRidePress = (ride: any) => {
    router.push({
      pathname: "/(protected)/ride/[id]",
      params: {
        id: ride._id,
      },
    });
  };

  // Clone and sort safely
  const sortedRides = [...(rides || [])].sort((a, b) => {
    const dateA = new Date(a.rideDate || 0);
    const dateB = new Date(b.rideDate || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // // Find the next upcoming ride (first future date)
  const now = new Date();

  let nextRide = sortedRides.find((ride) => {
    const rideDate = new Date(ride.rideDate || 0);
    return (
      rideDate.getDate() === now.getDate() &&
      rideDate.getMonth() === now.getMonth() &&
      rideDate.getFullYear() === now.getFullYear()
    );
  });

  // If no ride today, pick the next upcoming ride (future date)
  if (!nextRide) {
    nextRide = sortedRides.find((ride) => new Date(ride.rideDate || 0) > now);
  }

  // // Get remaining upcoming rides
  const upcomingRides = sortedRides.filter((ride) => {
    const rideDate = new Date(ride.rideDate || 0);

    // Include rides scheduled for today (any time of day) or after today
    const isSameDay =
      rideDate.getDate() === now.getDate() &&
      rideDate.getMonth() === now.getMonth() &&
      rideDate.getFullYear() === now.getFullYear();

    return (rideDate > now || isSameDay) && ride._id !== nextRide?._id;
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        <View
          className="w-12 h-12 rounded-full items-center shadow-lg justify-center"
          style={{ backgroundColor: "#000000" }}
        >
          <Text className="text-white text-lg font-interMedium">
            {user?.displayName.charAt(0) || user?.email.charAt(0)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text
            className=" text-xl font-interMedium"
            style={{ color: "#0A0A0A" }}
          >
            Welcome
          </Text>
          <Text
            className=" text-base font-interRegular"
            style={{ color: "#4B5563" }}
          >
            {user?.displayName || "User"}
          </Text>
        </View>

        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Next Ride Section */}
        {nextRide ? (
          <View className="mx-6 mt-6">
            <View
              className="rounded-2xl p-6 shadow-lg relative"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              {/* Next Ride capsule */}
              <View
                className="absolute top-3 left-4 rounded-full px-3 py-2 items-center justify-center"
                style={{ backgroundColor: "#7B3FE4" }}
              >
                <Text className="text-white text-sm font-interRegular">
                  Next Ride
                </Text>
              </View>
              <Text
                className="text-xl mb-2 mt-9 font-interMedium"
                style={{ color: "#0A0A0A" }}
              >
                {nextRide.rideName}
              </Text>
              <Text
                className="text-base font-interRegular"
                style={{ color: "#4B5563" }}
              >
                {nextRide.rideDescription || "Join us for an amazing ride!"}
              </Text>
              <View className="mb-6 gap-3 mt-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                  <Text
                    className="ml-3 text-base font-interRegular"
                    style={{ color: "#4B5563" }}
                  >
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
                  <Ionicons name="time-outline" size={20} color="#4B5563" />
                  <Text
                    className="ml-3  text-base font-interRegular"
                    style={{ color: "#4B5563" }}
                  >
                    {nextRide.rideTime
                      ? new Date(nextRide.rideTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "TBD"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="#4B5563" />
                  <Text
                    className="ml-3  text-base font-interRegular"
                    style={{ color: "#4B5563" }}
                  >
                    {nextRide.rideDestination}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: "#7B3FE4" }}
                className="rounded-xl py-4 items-center"
                onPress={() => handleNextRidePress(nextRide)}
              >
                <Text className="text-white text-base font-interMedium">
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            className="m-6 rounded-2xl shadow-lg p-6 h-[200px] items-center justify-center"
            style={{ backgroundColor: "#F9FAFB" }}
          >
            <Text
              className="text-center font-interRegular"
              style={{ color: "#4B5563" }}
            >
              No upcoming rides found
            </Text>
            <Text
              className="text-center mt-6 font-interRegular"
              style={{ color: "#4B5563" }}
            >
              Create one or join one to continue !
            </Text>
            <TouchableOpacity
              className="p-4 w-full mt-6 shadow-lg rounded-xl items-center"
              style={{ backgroundColor: "#7B3FE4" }}
              onPress={() => router.push("/(protected)/CreateRide")}
            >
              <Text className="text-white font-interRegular">Create ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Rides Section */}
        <View className="mx-6 mt-8 ">
          <Text
            className="text-lg font-interBold mb-6"
            style={{ color: "#0A0A0A" }}
          >
            Upcoming Rides
          </Text>
        </View>

        {upcomingRides.length > 0 ? (
          upcomingRides.map((ride) => <RideCard key={ride._id} ride={ride} />)
        ) : (
          <View
            className="shadow-lg mx-6 rounded-2xl p-6 mb-4 h-[300px] items-center justify-center"
            style={{ backgroundColor: "#F9FAFB" }}
          >
            <Text className="font-interRegular" style={{ color: "#4B5563" }}>
              Your upcoming rides will appear here
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
                    className="py-6 px-2 border-b border-gray-200"
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

      {/* If we have rides length is greater than 0 we display the pulse icon */}
      {rides && rides.length > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 82,
            left: 0,
            right: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background pulse effect */}
          <PulseAnimation size={80} color="rgba(123,63,228,0.3)" />

          {/* Actual button */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            style={{ backgroundColor: "#7B3FE4" }}
            className="p-6 rounded-full items-center justify-center shadow-lg"
          >
            {/* <Ionicons name="add" size={28} color="#7B3FE4" /> */}
            <Text className="text-2xl font-interMedium text-white">Go</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
