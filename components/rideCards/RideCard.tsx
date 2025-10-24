import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import formatDate from "@/utils/FormatDate";
import formatTime from "@/utils/FormatTime";
import { Ride } from "@/types/ride";

// Ride Card Component
const RideCard = ({ ride }: { ride: Ride }) => {
  const router = useRouter();

  const handleRidePress = (ride: any) => {
    router.push({
      pathname: "/(protected)/ride/[id]",
      params: {
        id: ride._id,
      },
    });
  };

  return (
    <View className="bg-white/10 rounded-2xl shadow-lg p-4 mb-4 mx-4 border border-white/20">
      <TouchableOpacity onPress={() => handleRidePress(ride)}>
        {/* Header with title and View on map button */}
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-xl font-bold text-white flex-1 mr-3">
            {ride.rideName}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: "#ff6b36" }}
            className="rounded-lg px-3 py-2"
          >
            <Text className="text-white text-sm font-medium">View on map</Text>
          </TouchableOpacity>
        </View>

        {/* Date and Time */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={16} color="white" />
          <Text className="text-white/70 ml-2 mr-4">
            {ride.rideDate ? formatDate(ride.rideDate) : "TBD"}
          </Text>
          <Ionicons name="time-outline" size={16} color="white" />
          <Text className="text-white/70 ml-2">
            {formatTime(ride.rideTime)}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="location-outline" size={16} color="white" />
          <Text className="text-white/70 ml-2 flex-1">
            {ride.rideDestination}
          </Text>
        </View>

        {/* Riders count */}
        <View className="flex-row justify-end items-center">
          <Ionicons name="bicycle-outline" size={16} color="white" />
          <Text className="text-white/70 ml-2">
            {ride.riders.length || 0} riders
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RideCard;
