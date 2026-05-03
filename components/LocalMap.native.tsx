import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface LocalMapProps {
  results: any[];
  userLocation: any;
  colors: any;
  onMarkerPress: (id: string) => void;
  onBackToList: () => void;
}

export default function LocalMap({ results, userLocation, colors, onMarkerPress }: LocalMapProps) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.coords.latitude ?? -34.6037,
          longitude: userLocation?.coords.longitude ?? -58.3816,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {results.map((local) => (
          <Marker
            key={local.id}
            coordinate={local.coordinates}
            title={local.name}
            description={local.categories.join(', ')}
            pinColor={colors.primary}
            onCalloutPress={() => onMarkerPress(local.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
