import { View, Text } from 'react-native'
import React from 'react'
import MapView,{Marker} from 'react-native-maps'
import { useLocalSearchParams } from 'expo-router';
import { useGetDestinationById } from '@/hooks/destination.hook';
import { Destination } from '@/Utils/types';
import { Colors } from '@/contants/colors';
import { Ionicons } from '@expo/vector-icons';

const MapContainerView = () => {
    const { DestinationId } = useLocalSearchParams();

    
  if (!DestinationId) return null;
   
  const { data, isFetching } = useGetDestinationById(DestinationId);
    const destination: Destination | undefined = data?.destination;

  if (isFetching || !destination) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="mt-3 text-gray-400 text-sm">
          Loading map...
        </Text>
      </View>
    );
  }
  return (
       <MapView
              style={{ flex: 1 }}
              provider="google"
              showsBuildings={true}
              initialRegion={{
                latitude: destination.latitude,
                longitude: destination.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }} // centers the marker on the coordinate
                tracksViewChanges={false}
                flat={true} // 👈 add this for iOS
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 30,
                    backgroundColor: Colors.primary[500], // use actual hex, not className
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible", // 👈 important
                  }}
                >
                  <Ionicons name="location" size={30} color={"white"} />
                </View>
              </Marker>
            </MapView>
  )
}

export default MapContainerView