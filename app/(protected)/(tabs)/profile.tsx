import React from 'react'
import { View, Text, Alert, TouchableOpacity } from 'react-native'
import { useAuth } from '../../../contexts/AuthContext';

const profile = () => {
  const { user, logout } = useAuth();

    const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        "Error",
        "Failed to sign out. Please try again."
      );
    }
  };

  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='text-red-500'>Profile, {user?.displayName}</Text>
      <TouchableOpacity>
        <Text className='text-blue-500' onPress={handleSignOut}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

export default profile