import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function notifications(){
  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: "#f5f5f5"}}>
  <View className="pt-4 pb-2 px-4">
        <Text className="text-2xl font-interBold" style={{color:"#0A0A0A"}}>Notifications</Text>
      </View>
    </SafeAreaView>
  )
}
