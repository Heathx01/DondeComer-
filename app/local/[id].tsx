import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Pressable, TextInput, Alert, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocalsController } from '@/src/controllers/LocalsController';
import { useAppContext } from '@/src/context/AppContext';
import ImageCarousel from '@/components/ImageCarousel';

export default function LocalDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { isFavorite, toggleFavorite } = useAppContext();

  const local = LocalsController.getFeaturedLocals().find(l => l.id === id) || LocalsController.getFeaturedLocals()[0];
  const isOpen = LocalsController.isLocalOpen(local);

  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  const handleToggleFavorite = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleFavorite(local.id);
  };

  const handleCall = () => {
    if (local.phoneNumber) {
      Linking.openURL(`tel:${local.phoneNumber}`);
    } else {
      Alert.alert('No disponible', 'Este local no tiene teléfono registrado.');
    }
  };

  const handleMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${local.coordinates.latitude},${local.coordinates.longitude}`;
    Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Carousel */}
        <View style={styles.imageContainer}>
          <ImageCarousel images={local.images} />
          
          <View style={[styles.headerActions, { top: insets.top + 10 }]}>
            <Pressable 
              style={styles.actionCircle} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            
            <Pressable 
              style={styles.actionCircle} 
              onPress={handleToggleFavorite}
            >
              <Ionicons 
                name={isFavorite(local.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite(local.id) ? '#FF4B4B' : 'white'} 
              />
            </Pressable>
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.mainInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="title">{local.name}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#4CAF5020' : '#F4433620' }]}>
                <ThemedText style={{ color: isOpen ? '#4CAF50' : '#F44336', fontWeight: 'bold', fontSize: 12 }}>
                  {isOpen ? 'ABIERTO' : 'CERRADO'}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.description}>{local.description}</ThemedText>
            
            <View style={styles.statsRow}>
              <View style={[styles.stat, { backgroundColor: colors.secondary + '30' }]}>
                <Ionicons name="star" size={16} color={colors.primary} />
                <ThemedText style={styles.statText}>{local.rating} ({local.reviewCount})</ThemedText>
              </View>
              <View style={[styles.stat, { backgroundColor: colors.secondary + '30' }]}>
                <Ionicons name="time" size={16} color={colors.primary} />
                <ThemedText style={styles.statText}>{local.hours.open} - {local.hours.close}</ThemedText>
              </View>
            </View>
          </View>

          {/* Menú */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Menú Sugerido</ThemedText>
            {local.menu.length > 0 ? local.menu.map((item) => (
              <View key={item.id} style={[styles.menuItem, { borderColor: colors.secondary + '30' }]}>
                <View style={styles.menuInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={styles.menuDesc}>{item.description}</ThemedText>
                  <ThemedText style={[styles.price, { color: colors.primary }]}>${item.price}</ThemedText>
                </View>
                <View style={[styles.menuImagePlaceholder, { backgroundColor: colors.surface }]}>
                  <Ionicons name="restaurant-outline" size={24} color={colors.icon} />
                </View>
              </View>
            )) : (
              <ThemedText style={{ opacity: 0.5, marginTop: 10 }}>No hay menú disponible aún.</ThemedText>
            )}
          </View>

          {/* Reviews Display */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Opiniones</ThemedText>
            {local.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <ThemedText type="defaultSemiBold">{rev.userName}</ThemedText>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Ionicons key={s} name="star" size={12} color={s <= rev.rating ? colors.primary : colors.icon} />
                    ))}
                  </View>
                </View>
                <ThemedText style={styles.reviewComment}>{rev.comment}</ThemedText>
                <ThemedText style={styles.reviewDate}>{rev.date}</ThemedText>
              </View>
            ))}
          </View>

          {/* Reviews Form */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Deja tu opinión</ThemedText>
            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setRating(s);
                }}>
                  <Ionicons 
                    name={s <= rating ? "star" : "star-outline"} 
                    size={30} 
                    color={colors.primary} 
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="¿Qué tal estuvo la comida?"
              placeholderTextColor={colors.icon}
              multiline
              style={[styles.reviewInput, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
              value={review}
              onChangeText={setReview}
            />
            <Pressable 
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!rating || !review) {
                  Alert.alert('Error', 'Por favor selecciona una calificación y escribe un comentario.');
                  return;
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('¡Gracias!', 'Tu reseña ha sido publicada correctamente.');
                setReview('');
                setRating(0);
              }}
            >
              <ThemedText style={styles.submitText}>Publicar Reseña</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <Pressable 
          style={[styles.fab, { backgroundColor: colors.primary }]} 
          onPress={handleCall}
        >
          <Ionicons name="call" size={24} color="white" />
        </Pressable>
        <Pressable 
          style={[styles.fab, { backgroundColor: '#4285F4' }]} 
          onPress={handleMap}
        >
          <Ionicons name="navigate" size={24} color="white" />
        </Pressable>
      </View>
    </ThemedView>
  );
}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  headerActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  actionCircle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 100,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainInfo: {
    marginBottom: 25,
  },
  description: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 10,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 15,
  },
  menuInfo: {
    flex: 1,
  },
  menuDesc: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 6,
  },
  menuImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 5,
  },
  ratingPicker: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 15,
  },
  reviewInput: {
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    gap: 15,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
