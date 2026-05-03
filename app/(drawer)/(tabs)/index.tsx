import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View, Pressable, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocalsController } from '@/src/controllers/LocalsController';
import { useAppContext } from '@/src/context/AppContext';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { calculateDistance } from '@/src/services/LocationService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { searchHistory, addToHistory } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Verificamos si los servicios están activados antes de pedir posición
          const enabled = await Location.hasServicesEnabledAsync();
          if (enabled) {
            let location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation(location);
          }
        }
      } catch (error) {
        console.warn('Error al obtener la ubicación:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredLocals = LocalsController.getFeaturedLocals();
  const promotedLocals = LocalsController.getPromotedLocals();

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToHistory(query);
    router.push({ pathname: '/explore', params: { q: query } });
  };

  const handleNearMe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    
    router.push({ pathname: '/explore', params: { nearMe: 'true' } });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Personalizado (Integrado con el Drawer) */}
        <View style={styles.headerSpacer} />

        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              placeholder="Buscar comida o lugares..."
              placeholderTextColor={colors.icon}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
          </View>

          <Pressable 
            style={[styles.nearMeButton, { backgroundColor: colors.primary }]}
            onPress={handleNearMe}
          >
            <Ionicons name="location" size={18} color="white" />
            <ThemedText style={styles.nearMeButtonText}>Buscar locales cerca de mí</ThemedText>
          </Pressable>
          
          {searchHistory.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
              {searchHistory.map((h, i) => (
                <Pressable 
                  key={i} 
                  onPress={() => handleSearch(h)}
                  style={[styles.historyChip, { backgroundColor: colors.secondary + '30' }]}
                >
                  <ThemedText style={styles.historyText}>{h}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Promoted Locals Carousel */}
        {promotedLocals.length > 0 && (
          <View style={styles.promotedSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Destacados de hoy</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promotedScroll}>
              {promotedLocals.map((local) => (
                <Pressable 
                  key={local.id}
                  onPress={() => router.push(`/local/${local.id}`)}
                  style={[styles.promotedCard, { backgroundColor: colors.surface }]}
                >
                  <Image source={{ uri: local.images[0] }} style={styles.promotedImage} />
                  <View style={styles.promotedOverlay}>
                    <ThemedText type="defaultSemiBold" style={styles.promotedName}>{local.name}</ThemedText>
                    <View style={styles.promotedBadge}>
                      <Ionicons name="flash" size={12} color={colors.primary} />
                      <ThemedText style={styles.promotedBadgeText}>Promocionado</ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <ThemedView style={styles.content}>
          {/* Categories */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Categorías populares</ThemedText>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta'].map((cat) => (
              <Pressable 
                key={cat} 
                onPress={() => handleSearch(cat)}
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
              >
                <Ionicons name={getCategoryIcon(cat)} size={24} color={colors.primary} />
                <ThemedText style={styles.categoryText}>{cat}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Featured Locals */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recomendados para ti</ThemedText>
            <Pressable onPress={() => router.push('/explore')}>
              <ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Ver todos</ThemedText>
            </Pressable>
          </View>

          {loading ? (
            <View>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.skeletonItem}>
                  <SkeletonLoader height={180} width="100%" borderRadius={25} />
                  <SkeletonLoader height={20} width="60%" style={{ marginTop: 10 }} />
                  <SkeletonLoader height={15} width="40%" style={{ marginTop: 5 }} />
                </View>
              ))}
            </View>
          ) : (
            featuredLocals.map((local) => (
              <Pressable 
                key={local.id} 
                onPress={() => router.push(`/local/${local.id}`)}
                style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
              >
                <Image source={{ uri: local.images[0] }} style={styles.featuredImage} />
                <View style={styles.featuredInfo}>
                  <View style={styles.nameRow}>
                    <ThemedText type="defaultSemiBold" style={styles.localName} numberOfLines={1}>{local.name}</ThemedText>
                    <View style={[styles.ratingBadge, { backgroundColor: colors.secondary }]}>
                      <Ionicons name="star" size={12} color={colors.primary} />
                      <ThemedText style={[styles.ratingText, { color: colors.primary }]}>{local.rating}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.featuredSub}>{local.categories.join(' • ')} • {local.address}</ThemedText>
                  <View style={styles.distanceRow}>
                    <Ionicons name="location" size={14} color={colors.primary} />
                    <ThemedText style={styles.distanceText}>
                      {userLocation ? 
                        calculateDistance(
                          userLocation.coords.latitude, 
                          userLocation.coords.longitude, 
                          local.coordinates.latitude, 
                          local.coordinates.longitude
                        ).toFixed(1) + ' km de ti' : 'Cerca de ti'}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

function getCategoryIcon(cat: string): any {
  switch (cat) {
    case 'Pizza': return 'pizza';
    case 'Burger': return 'fast-food';
    case 'Sushi': return 'fish';
    case 'Tacos': return 'flame';
    case 'Pasta': return 'restaurant';
    default: return 'cafe';
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerSpacer: {
    height: 10,
  },
  ownerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ownerToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  nearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 15,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  nearMeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  heroContainer: {
    height: 180,
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoriesScroll: {
    gap: 12,
    paddingBottom: 20,
  },
  categoryCard: {
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  featuredCard: {
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    height: 180,
    width: '100%',
  },
  featuredInfo: {
    padding: 15,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  localName: {
    fontSize: 18,
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredSub: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  historyScroll: {
    marginTop: 10,
    gap: 8,
  },
  historyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  historyText: {
    fontSize: 12,
    opacity: 0.8,
  },
  promotedSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 15,
  },
  promotedScroll: {
    paddingLeft: 20,
    gap: 15,
  },
  promotedCard: {
    width: width * 0.7,
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promotedImage: {
    width: '100%',
    height: '100%',
  },
  promotedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    justifyContent: 'flex-end',
  },
  promotedName: {
    color: 'white',
    fontSize: 18,
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
  },
  promotedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  skeletonItem: {
    marginBottom: 20,
  },
});
