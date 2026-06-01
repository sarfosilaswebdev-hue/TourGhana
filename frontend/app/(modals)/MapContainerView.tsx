import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useGetDestinationById } from "@/hooks/destination.hook";
import { Destination } from "@/Utils/types";
import { Colors } from "@/contants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Categories ───────────────────────────────────────────────────────────────

type PlaceType = "restaurant" | "cafe" | "attraction" | "museum" | "park" | "hotel";

interface PlaceCategory {
  type: PlaceType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  // Overpass OSM tag selectors
  tags: string[];
}

const CATEGORIES: PlaceCategory[] = [
  {
    type: "restaurant",
    label: "Restaurants",
    icon: "restaurant",
    color: "#EF4444",
    tags: ['node["amenity"="restaurant"]', 'node["amenity"="fast_food"]'],
  },
  {
    type: "cafe",
    label: "Cafes",
    icon: "cafe",
    color: "#F97316",
    tags: ['node["amenity"="cafe"]', 'node["amenity"="bar"]'],
  },
  {
    type: "attraction",
    label: "Attractions",
    icon: "camera",
    color: "#3B82F6",
    tags: ['node["tourism"="attraction"]', 'node["historic"]', 'node["tourism"="viewpoint"]'],
  },
  {
    type: "museum",
    label: "Museums",
    icon: "business",
    color: "#8B5CF6",
    tags: ['node["tourism"="museum"]', 'node["amenity"="arts_centre"]'],
  },
  {
    type: "park",
    label: "Parks",
    icon: "leaf",
    color: "#10B981",
    tags: ['node["leisure"="park"]', 'node["leisure"="garden"]', 'node["tourism"="zoo"]'],
  },
  {
    type: "hotel",
    label: "Hotels",
    icon: "bed",
    color: "#F2C94C",
    tags: ['node["tourism"="hotel"]', 'node["tourism"="guest_house"]', 'node["tourism"="hostel"]'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface NearbyPlace {
  id: number;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

// ─── Overpass API fetch ───────────────────────────────────────────────────────

async function fetchOverpassPlaces(
  lat: number,
  lng: number,
  radius: number,
  activeTypes: Set<PlaceType>
): Promise<NearbyPlace[]> {
  const activeCats = CATEGORIES.filter((c) => activeTypes.has(c.type));
  if (activeCats.length === 0) return [];

  // Build the Overpass QL query
  const selectors = activeCats.flatMap((cat) =>
    cat.tags.map((tag) => `  ${tag}(around:${radius},${lat},${lng});`)
  );
  const query = `[out:json][timeout:15];\n(\n${selectors.join("\n")}\n);\nout body;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    const json = await res.json();

    const results: NearbyPlace[] = [];

    for (const el of json.elements ?? []) {
      if (!el.tags?.name || el.lat == null || el.lon == null) continue;

      // Determine which of our categories this element belongs to
      let matchedType: PlaceType | null = null;
      outer: for (const cat of activeCats) {
        for (const tagSelector of cat.tags) {
          // tagSelector looks like: node["amenity"="restaurant"]
          const match = tagSelector.match(/\["(\w+)"="?([^"\]]+)"?\]/);
          if (!match) continue;
          const [, key, val] = match;
          if (key === "historic" && el.tags.historic) {
            matchedType = cat.type;
            break outer;
          }
          if (el.tags[key] === val) {
            matchedType = cat.type;
            break outer;
          }
        }
      }

      if (!matchedType) continue;

      results.push({
        id: el.id,
        name: el.tags.name,
        type: matchedType,
        lat: el.lat,
        lng: el.lon,
        tags: el.tags,
      });
    }

    return results;
  } catch {
    return [];
  }
}

function getCategoryMeta(type: PlaceType): PlaceCategory {
  return CATEGORIES.find((c) => c.type === type)!;
}

function getPlaceSubtitle(place: NearbyPlace): string {
  const t = place.tags;
  if (t.cuisine) return `Cuisine: ${t.cuisine.replace(/_/g, " ")}`;
  if (t["addr:street"]) return t["addr:street"];
  if (t.description) return t.description.slice(0, 60);
  return getCategoryMeta(place.type).label.replace(/s$/, "");
}

// ─── Component ────────────────────────────────────────────────────────────────

const MapContainerView = () => {
  const { DestinationId } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { top } = useSafeAreaInsets();

  const [activeTypes, setActiveTypes] = useState<Set<PlaceType>>(
    new Set(["restaurant", "attraction"])
  );
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;

  if (!DestinationId) return null;

  const { data, isFetching } = useGetDestinationById(DestinationId);
  const destination: Destination | undefined = data?.destination;

  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    setLoadingPlaces(true);
    setPlaces([]);

    fetchOverpassPlaces(destination.latitude, destination.longitude, 1500, activeTypes).then(
      (results) => {
        if (cancelled) return;
        setPlaces(results);
        setLoadingPlaces(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [destination, activeTypes]);

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: selectedPlace ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [selectedPlace]);

  function toggleCategory(type: PlaceType) {
    setSelectedPlace(null);
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return next;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  if (isFetching || !destination) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={Colors.primary.DEFAULT} />
        <Text className="mt-3 text-gray-400 text-sm">Loading map…</Text>
      </View>
    );
  }

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
  });

  return (
    <View style={{ flex: 1 }}>
      {/* ── Map ── */}
      <MapView
        style={{ flex: 1 }}
        provider="google"
        showsBuildings
        showsPointsOfInterest
        showsUserLocation
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={() => setSelectedPlace(null)}
      >
        {/* Destination marker */}
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          flat
          zIndex={999}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: Colors.primary[500],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={28} color="white" />
          </View>
        </Marker>

        {/* Nearby place markers */}
        {places.map((place) => {
          const meta = getCategoryMeta(place.type);
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              onPress={() => setSelectedPlace(place)}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: meta.color,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "white",
                }}
              >
                <Ionicons name={meta.icon} size={17} color="white" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── Category filter bar ── */}
      <View style={{ position: "absolute", top: top + 16, left: 0, right: 0 }} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeTypes.has(cat.type);
            return (
              <TouchableOpacity
                key={cat.type}
                onPress={() => toggleCategory(cat.type)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? cat.color : "white",
                }}
              >
                <Ionicons name={cat.icon} size={13} color={active ? "white" : cat.color} />
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#374151" }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Loading pill ── */}
      {loadingPlaces && (
        <View
          style={{
            position: "absolute",
            top: top + 68,
            alignSelf: "center",
            backgroundColor: "white",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
          <Text style={{ fontSize: 12, color: "#6B7280" }}>Finding nearby places…</Text>
        </View>
      )}

      {/* ── Selected place card ── */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 24,
          left: 16,
          right: 16,
          transform: [{ translateY: cardTranslate }],
          opacity: cardAnim,
        }}
        pointerEvents={selectedPlace ? "auto" : "none"}
      >
        {selectedPlace && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: getCategoryMeta(selectedPlace.type).color,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ionicons
                name={getCategoryMeta(selectedPlace.type).icon}
                size={22}
                color="white"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}
                numberOfLines={1}
              >
                {selectedPlace.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }} numberOfLines={1}>
                {getPlaceSubtitle(selectedPlace)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: getCategoryMeta(selectedPlace.type).color + "22",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: getCategoryMeta(selectedPlace.type).color,
                    }}
                  >
                    {getCategoryMeta(selectedPlace.type).label.replace(/s$/, "")}
                  </Text>
                </View>
                {selectedPlace.tags.opening_hours && (
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {selectedPlace.tags.opening_hours.split(";")[0]}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={() => setSelectedPlace(null)}>
              <Ionicons name="close-circle" size={22} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default MapContainerView;
