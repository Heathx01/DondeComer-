import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ThemedText } from './themed-text';

interface LocalMapProps {
  results: any[];
  userLocation: any;
  colors: any;
  onMarkerPress: (id: string) => void;
  onBackToList: () => void;
}

export default function LocalMap({ results, userLocation, colors, onMarkerPress, onBackToList }: LocalMapProps) {
  const initialRegion = userLocation ? {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: -34.6037, // Default to Buenos Aires
    longitude: -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {results.map((local) => (
          <Marker
            key={local.id}
            coordinate={{
              latitude: local.coordinates.latitude,
              longitude: local.coordinates.longitude,
            }}
            title={local.name}
            description={local.categories.join(', ')}
            onCalloutPress={() => onMarkerPress(local.id)}
            pinColor={colors.primary}
          />
        ))}
      </MapView>
      
      <Pressable 
        style={[styles.floatingBack, { backgroundColor: colors.surface }]}
        onPress={onBackToList}
      >
        <Ionicons name="list" size={24} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  floatingBack: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
