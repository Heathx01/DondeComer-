import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

interface LocalMapProps {
  results: any[];
  userLocation: any;
  colors: any;
  onMarkerPress: (id: string) => void;
  onBackToList: () => void;
}

export default function LocalMap({ colors, onBackToList }: LocalMapProps) {
  return (
    <View style={styles.webFallback}>
      <Ionicons name="map-outline" size={50} color={colors.primary} />
      <ThemedText style={styles.webFallbackText}>
        La vista de mapa interactiva está disponible en dispositivos iOS y Android.
      </ThemedText>
      <Pressable 
        style={[styles.backButton, { backgroundColor: colors.primary }]}
        onPress={onBackToList}
      >
        <ThemedText style={styles.backButtonText}>Volver a la lista</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  webFallbackText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
