import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: "#f5f5f5"}}>
        <View className="pt-4 pb-2 px-4">
        <Text className="text-2xl font-interBold" style={{color:"#0A0A0A"}}>Profile</Text>
      </View>
      <View className="flex-1 justify-between mx-4">
        {/* Top content */}
        <View>
          {/* Profile Picture */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-black rounded-full items-center justify-center">
              <Text className="text-2xl text-white font-interRegular"> {user?.displayName.charAt(0) || user?.email.charAt(0)}</Text>
            </View>
            <Text className="mt-4 text-xl font-interMedium text-black">{user?.displayName}</Text>
          </View>

          {/* User Info */}
          <View className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
            <Text className="text-gray-600 text-lg mb-2 font-interMedium">Name</Text>
            <Text className="text-black text-base font-medium mb-4 font-interRegular">{user?.displayName}</Text>
            <Text className="text-gray-600 text-lg mb-2 font-interMedium">Email</Text>
            <Text className="text-black text-base font-medium mb-4 font-interRegular">{user?.email}</Text>
          </View>
        </View>

        {/* Sign Out Button at bottom */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 py-4 rounded-xl items-center mb-6"
        >
          <Text className="text-white text-base font-interRegular">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
