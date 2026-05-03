import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LocalMap from '@/components/LocalMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocalsController } from '@/src/controllers/LocalsController';
import { Local } from '@/src/models/Local';
import { calculateDistance } from '@/src/services/LocationService';

const DISTANCE_OPTIONS = [1, 2, 5, 10, 20];

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  const { q, nearMe } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((q as string) || '');
  const [results, setResults] = useState<Local[]>([]);
  const [activeDistance, setActiveDistance] = useState<number | null>(nearMe === 'true' ? 5 : null);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para mostrarte los locales más cercanos.');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      } catch (e) {
        console.log('Error getting location', e);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let filtered = LocalsController.searchLocals(searchQuery, {
      minRating: minRating ?? undefined,
      onlyOpen: onlyOpen
    });

    if (activeDistance && userLocation) {
      filtered = LocalsController.getLocalsByDistance(
        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
        activeDistance
      ).filter(l => filtered.some(f => f.id === l.id));
    }

    setResults(filtered);
  }, [searchQuery, activeDistance, userLocation, onlyOpen, minRating]);

  const toggleOpenOnly = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOnlyOpen(!onlyOpen);
  };

  const toggleMinRating = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMinRating(minRating === 4.5 ? null : 4.5);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 10 }}>Obteniendo ubicación...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="title">Explorar</ThemedText>
          <Pressable
            style={[styles.mapToggle, { backgroundColor: colors.secondary }]}
            onPress={() => {
              Haptics.selectionAsync();
              setViewMode(viewMode === 'list' ? 'map' : 'list');
            }}
          >
            <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={20} color={colors.primary} />
            <ThemedText style={[styles.mapToggleText, { color: colors.primary }]}>
              {viewMode === 'list' ? 'Mapa' : 'Lista'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            placeholder="Buscar por nombre o comida..."
            placeholderTextColor={colors.icon}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros Avanzados */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          <Pressable
            onPress={toggleOpenOnly}
            style={[
              styles.filterChip,
              {
                backgroundColor: onlyOpen ? colors.primary : colors.surface,
                borderColor: colors.secondary
              }
            ]}
          >
            <Ionicons name="time" size={14} color={onlyOpen ? 'white' : colors.primary} />
            <ThemedText style={[styles.filterText, { color: onlyOpen ? 'white' : colors.text }]}>
              Abierto ahora
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={toggleMinRating}
            style={[
              styles.filterChip,
              {
                backgroundColor: minRating ? colors.primary : colors.surface,
                borderColor: colors.secondary
              }
            ]}
          >
            <Ionicons name="star" size={14} color={minRating ? 'white' : colors.primary} />
            <ThemedText style={[styles.filterText, { color: minRating ? 'white' : colors.text }]}>
              4.5+ estrellas
            </ThemedText>
          </Pressable>

          <View style={{ width: 1, backgroundColor: colors.secondary, height: '60%', alignSelf: 'center', marginHorizontal: 5 }} />

          <Pressable
            onPress={() => setActiveDistance(null)}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeDistance === null ? colors.primary : colors.surface,
                borderColor: colors.secondary
              }
            ]}
          >
            <ThemedText style={[styles.filterText, { color: activeDistance === null ? 'white' : colors.text }]}>
              Todas distancias
            </ThemedText>
          </Pressable>
          {DISTANCE_OPTIONS.map((km) => (
            <Pressable
              key={km}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveDistance(km);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeDistance === km ? colors.primary : colors.surface,
                  borderColor: colors.secondary
                }
              ]}
            >
              <ThemedText style={[styles.filterText, { color: activeDistance === km ? 'white' : colors.text }]}>
                {km} km
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {results.length > 0 ? (
            results.map((local) => (
              <Pressable
                key={local.id}
                onPress={() => router.push(`/local/${local.id}`)}
                style={[styles.resultItem, { borderBottomColor: colors.secondary + '40' }]}
              >
                <View style={[styles.resultImage, { backgroundColor: colors.secondary + '30' }]}>
                  <Ionicons name="restaurant" size={30} color={colors.primary} />
                </View>
                <View style={styles.resultInfo}>
                  <ThemedText type="defaultSemiBold" style={styles.resultName}>{local.name}</ThemedText>
                  <ThemedText style={styles.resultSub}>{local.categories.join(', ')}</ThemedText>
                  <View style={styles.metaRow}>
                    <View style={styles.badge}>
                      <Ionicons name="star" size={12} color={colors.primary} />
                      <ThemedText style={styles.badgeText}>{local.rating}</ThemedText>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="location" size={12} color={colors.primary} />
                      <ThemedText style={styles.badgeText}>
                        {userLocation ?
                          calculateDistance(
                            userLocation.coords.latitude,
                            userLocation.coords.longitude,
                            local.coordinates.latitude,
                            local.coordinates.longitude
                          ).toFixed(1) + ' km' : '--'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color={colors.icon} />
              <ThemedText style={{ opacity: 0.6, marginTop: 10 }}>No hay locales en este rango...</ThemedText>
            </View>
          )}
        </ScrollView>
      ) : (
        <LocalMap
          results={results}
          userLocation={userLocation}
          colors={colors}
          onMarkerPress={(id) => router.push(`/local/${id}`)}
          onBackToList={() => setViewMode('list')}
        />
      )}
    </ThemedView>
  );
}

// Utility for display


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    gap: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  mapToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  distanceFilterSection: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  filterContainer: {
    gap: 10,
    paddingVertical: 5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 17,
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
