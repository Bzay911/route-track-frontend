import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import { RideProvider } from "../../contexts/RideContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RideProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="createRide"
                  options={{ title: "Create Ride" }}
                />
                <Stack.Screen name="ride/[id]" options={{ title: "" }} />
                <Stack.Screen
                  name="startRide"
                  options={{ headerShown: false }}
                />
              </Stack>
            </RideProvider>
            <StatusBar style="auto" />
          </ThemeProvider>
        </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
