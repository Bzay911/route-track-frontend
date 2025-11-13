import { API_BASE_URL } from "@/config/apiConfig";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRide } from "../../contexts/RideContext";
import { useAuth } from "@/contexts/AuthContext";
import AutoCompleteTextField from "@/components/textField/AutoCompleteTextField";

const CreateRide = () => {
  const router = useRouter();

  // Contexts
  const { setRides } = useRide();
  const { token } = useAuth();

  // States 
  const [rideName, setRideName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleCreateRide = async () => {
    // Validate required fields
    if (!rideName.trim()) {
      Alert.alert("Error", "Please enter a ride name");
      return;
    }

    if (!destinationCoords) {
      Alert.alert("Error", "Please enter a destination");
      return;
    }

    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (!selectedTime) {
      Alert.alert("Error", "Please select a time");
      return;
    }

    try {
      setIsLoading(true);
      const newRide = {
        rideName,
        destinationCoords,
        destinationName,
        selectedDate: selectedDate?.toISOString(),
        selectedTime: selectedTime?.toISOString(),
        description,
      };
      const response = await fetch(`${API_BASE_URL}/api/rides/create-ride`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRide),
      });
      if (!response.ok) {
        throw new Error("Failed to create ride");
      }
      const data = await response.json();
      setIsLoading(false);
      setRides((prev) => [data.ride, ...(prev || [])]);
      Alert.alert("Ride created successfully");
      router.push("/");
    } catch (error) {
      console.error("Error creating ride:", error);
      Alert.alert("Error", "Failed to create ride. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#f5f5f5" }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mx-4 mb-4 mt-4 flex-row items-center"
        >
          <Ionicons name="chevron-back-outline" size={30} color={"black"} />
          <Text className="text-lg font-interRegular">Back</Text>
        </TouchableOpacity>
  <KeyboardAvoidingView 
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={0}
  >
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Ride Name Input */}
        <View className="mb-6">
          <Text
            className=" text-base font-interMedium mb-3"
            style={{ color: "#0A0A0A" }}
          >
            Ride Name
          </Text>
          <TextInput
            value={rideName}
            onChangeText={setRideName}
            placeholder="e.g. Weekend Coastal Run"
            placeholderTextColor="#9ca3af"
            className="bg-white shadow-lg font-interRegular rounded-xl px-4 py-4 text-black text-base"
          />
        </View>
        {/* Destination Input */}
        <View className="mb-6">
          <Text
            className="text-white text-base font-interMedium mb-3"
            style={{ color: "#0A0A0A" }}
          >
            Destination
          </Text>
          <AutoCompleteTextField
            setDestinationCoords={setDestinationCoords}
            setDestinationName={setDestinationName}
          />
        </View>
        {/* Date Input */}
        <View className="mb-6">
          <Text
            className=" text-base font-interMedium mb-3"
            style={{ color: "#0A0A0A" }}
          >
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white shadow-lg rounded-xl px-4 py-4 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={20} color="#4B5563" />
            <Text
              className={`ml-3 font-interRegular text-base ${selectedDate ? "text-black" : "text-gray-400"}`}
            >
              {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              textColor="#4B5563"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          )}
        </View>
        {/* Time Input */}
        <View className="mb-6">
          <Text
            className=" text-base font-interMedium mb-3"
            style={{ color: "#0A0A0A" }}
          >
            Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-white shadow-lg rounded-xl px-4 py-4 flex-row items-center"
          >
            <Ionicons name="time-outline" size={20} color="#4B5563" />
            <Text
              className={`ml-3 font-interRegular text-base ${selectedTime ? "#4B5563" : "text-gray-400"}`}
            >
              {selectedTime
                ? selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select time"}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
              textColor="#4B5563"
              style={{ backgroundColor: "#FFFFFF" }}
            />
          )}
        </View>
        {/* Description Input */}
        <View className="mb-8">
          <Text
            className=" text-base font-interMedium mb-3"
            style={{ color: "#0A0A0A" }}
          >
            Description (Optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add details about the ride, route highlights or what riders should bring..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white shadow-lg rounded-xl px-4 py-4 text-black text-base font-interRegular"
            style={{ minHeight: 100 }}
          />
        </View>
        {/* Create Ride Button */}
        <TouchableOpacity
          style={{ backgroundColor: "#7B3FE4" }}
          className="shadow-lg rounded-xl py-4 items-center mb-8"
          onPress={handleCreateRide}
        >
          <Text className="text-white text-base font-interMedium">
            {isLoading ? "Creating Ride" : "Create Ride"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateRide;
