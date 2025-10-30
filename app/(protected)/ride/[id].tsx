import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import formatDate from "../../../utils/FormatDate";
import formatTime from "../../../utils/FormatTime";
import { useRide } from "@/contexts/RideContext";
import { Ride } from "@/types/ride";
import InviteButton from "@/components/button/InviteButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import hasRideStarted from "@/utils/HasRideStarted";

type Tab = "members" | "invite";

export default function Details() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const { fetchRideById } = useRide();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

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

  // console.log('ride', ride)

  useEffect(() => {
    if (ride?.createdby && user?._id) {
      setIsAdmin(ride.createdby.toString() === user._id.toString());
    }
  }, [ride, user]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1f3a",
        }}
      >
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1f3a" }}>
      <ScrollView className="flex-1">
        {/* Group Details Card */}
        <View className="mx-6">
          <View className="bg-white/10 rounded-2xl p-6">
            <Text className="text-white text-2xl font-bold mb-2">
              {ride?.rideName}
            </Text>
            <Text className="text-white/70 text-base mb-4">
              {ride?.rideDescription || "Welcome to the group"}
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatDate(ride?.rideDate as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {formatTime(ride?.rideTime as string)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="white" />
                <Text className="text-white/70 ml-3">
                  {ride?.rideDestination}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-6 mt-8 mb-4 bg-white/5 rounded-2xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setActiveTab("members")}
            className={`flex-1 py-2 ${activeTab === "members" ? "bg-blue-500" : "bg-transparent"}`}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "members" ? "text-white" : "text-white/70"}`}
            >
              Riders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("invite")}
            className={`flex-1 py-2 ${activeTab === "invite" ? "bg-blue-500" : "bg-transparent"}`}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "invite" ? "text-white" : "text-white/70"}`}
            >
              Invite
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Data Rendering */}
        <View className="mx-6 mt-4">
          {activeTab === "members" ? (
            <View>
              {ride?.riders.map((rider: any) => {
                const riderUser = rider.user;
                const isRiderAdmin = riderUser._id === ride.createdby;

                return (
                  <View
                    key={rider._id}
                    className="bg-white/10 rounded-lg p-4 mb-3 flex-row items-center justify-between relative"
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-bold">
                          {riderUser.email.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white font-semibold">
                          {riderUser.displayName || "Unnamed Rider"}
                        </Text>
                        <Text className="text-white/70">{riderUser.email}</Text>
                      </View>
                    </View>

                    {/* Admin badge */}
                    {isRiderAdmin && (
                      <View className="bg-green-600 px-3 py-1 rounded-full absolute top-0 right-0 m-2">
                        <Text className="text-white text-xs">Admin</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* If admin show start ride else show join ride  */}
              {isAdmin ? (
                ride?.riders.length === 1 ? (
                  // Only admin is in the ride
                  <View className="bg-white/10 rounded-2xl p-6 items-center shadow-lg w-full max-w-sm mt-6">
 
                    {/* Navigate to Invite Button */}
                    <TouchableOpacity
                      onPress={() => setActiveTab("invite")}
                      className="bg-yellow-500 rounded-lg py-3 px-6 mb-4 w-full items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold text-lg">
                        Invite Members
                      </Text>
                    </TouchableOpacity>

                    {/* Info Text */}
                    <Text className="text-center text-gray-300 text-base leading-relaxed">
                      Invite some members first to begin the ride!
                    </Text>
                  </View>
                ) : (
                  // Admin + other riders
                  <TouchableOpacity
                    style={{ backgroundColor: "#ff6b36" }}
                    className="rounded-xl py-4 items-center mt-4"
                    onPress={() => {
                      if (ride) handleRidePress(ride);
                    }}
                  >
                    <Text className="text-white font-semibold">Start Ride</Text>
                  </TouchableOpacity>
                )
              ) : (
                // Non-admin
                <TouchableOpacity
                  style={{ backgroundColor: "#ff6b36" }}
                  className="rounded-xl py-4 items-center mt-4"
                     onPress={() => {
                      if (ride) handleRidePress(ride);
                    }}
                >
                  <Text className="text-white font-semibold">Join Ride</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <InviteButton id={id as string} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
