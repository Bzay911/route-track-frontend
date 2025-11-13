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
import { RouteProvider } from "@/contexts/RouteContext";
import { useFonts } from "expo-font";

export default function ProtectedLayout() {
  const [loaded, error] = useFonts({
    "Inter-Bold": require("../../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-Regular": require("../../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("../../assets/fonts/Inter_18pt-Medium.ttf"),
  });

  const colorScheme = useColorScheme();

  if (!loaded || error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <RideProvider>
            <RouteProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="CreateRide"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ride/[id]"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="StartRide"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="LiveRideScreen"
                  options={{ headerShown: false }}
                />
              </Stack>
            </RouteProvider>
          </RideProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
