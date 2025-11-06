import {
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useState } from "react";

const MAP_BOX_API_KEY =
  "pk.eyJ1IjoiYnpheSIsImEiOiJjbTdqbnd1aXYwOWxxMmxvcDZyYnVyajY2In0.fWgqrA1nTjIlSWg_VEyOiQ";

const searchPlaces = async (query: string) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?autocomplete=true&access_token=${MAP_BOX_API_KEY}&limit=5&country=AU`
    );
    const data = await response.json();
    // Returns an array of place suggestions
    return data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.place_name,
      coordinates: feature.geometry.coordinates,
    }));
  } catch (err) {
    console.error("Error fetching places:", err);
    return [];
  }
};

const AutoCompleteTextField = ({
  setDestinationCoords,
  setDestinationName
}: {
  setDestinationCoords: (coords: [number, number]) => void;
  setDestinationName: (destinationName: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      const places = await searchPlaces(text);
      setResults(places);
    } else {
      setResults([]);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="e.g. Pacific Coast Highway"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={handleSearch}
        className="bg-white shadow-lg font-interRegular rounded-xl px-4 py-4 text-base"
      />
      {results.length > 0 && (
        <View>
          {results.map((item) => (
               <TouchableOpacity
               key={item.id}
              onPress={() => {
                setDestinationCoords(item.coordinates);
                setDestinationName(item.name);
                setQuery(item.name);
                setResults([]);
              }}
              className="p-4 border-b border-gray-300"
            >
              <Text className="font-interRegular">{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default AutoCompleteTextField;
