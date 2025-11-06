import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

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
    <View className="flex-1 bg-white px-6 pt-12">
      {/* Profile Picture */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-gray-300 rounded-full items-center justify-center">
          {/* Placeholder for avatar */}
          <Text className="text-2xl text-white">{user?.email?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text className="mt-4 text-xl font-semibold text-black">{user?.email}</Text>
      </View>

      {/* User Info */}
      <View className="mb-8">
        <Text className="text-gray-600 text-base mb-2">Email</Text>
        <Text className="text-black text-base font-medium mb-4">{user?.email}</Text>

        {/* Other profile info can go here */}
        {/* Example: Phone, Joined Date, etc. */}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 py-4 rounded-xl items-center"
      >
        <Text className="text-white text-lg font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
