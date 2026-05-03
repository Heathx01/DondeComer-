import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ImageCarousel from '@/components/ImageCarousel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/src/context/AppContext';
import { LocalsController } from '@/src/controllers/LocalsController';

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
  const [localData, setLocalData] = useState(local);
  
  // New features state
  const [reservationModal, setReservationModal] = useState(false);
  const [preOrderModal, setPreOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<string[]>([]);
  const [reservationDate, setReservationDate] = useState('Hoy, 20:00');
  const [guests, setGuests] = useState(2);

  const handleToggleFavorite = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleFavorite(local.id);
  };

  const handleReservation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReservationModal(false);
    Alert.alert('¡Reserva Confirmada!', `Tu mesa para ${guests} personas ha sido reservada para ${reservationDate}.`);
  };

  const handlePreOrder = () => {
    if (orderItems.length === 0) {
      Alert.alert('Carrito vacío', 'Por favor selecciona al menos un plato.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPreOrderModal(false);
    Alert.alert('¡Pedido Enviado!', 'Estamos preparando tu comida. Estará lista en 15 minutos, ¡justo para cuando llegues!');
    setOrderItems([]);
  };

  const toggleOrderItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (orderItems.includes(itemId)) {
      setOrderItems(orderItems.filter(id => id !== itemId));
    } else {
      setOrderItems([...orderItems, itemId]);
    }
  };


  const handleCall = () => {
    if (local.phoneNumber) {
      Linking.openURL(`tel:${local.phoneNumber}`);
    } else {
      Alert.alert('No disponible', 'Este local no tiene teléfono registrado.');
    }
  };

  const handleMap = () => {
    // Usamos 'dir' en lugar de 'search' para que Google Maps inicie la navegación
    // y muestre la ubicación del usuario como punto de origen por defecto.
    const url = `https://www.google.com/maps/dir/?api=1&destination=${local.coordinates.latitude},${local.coordinates.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header Image Carousel */}
          <View style={styles.imageContainer}>
            <ImageCarousel images={localData.images} />

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
                  name={isFavorite(localData.id) ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite(localData.id) ? '#FF4B4B' : 'white'}
                />
              </Pressable>
            </View>
          </View>

          <View style={[styles.content, { backgroundColor: colors.background }]}>
            <View style={styles.mainInfo}>
              <View style={styles.nameRow}>
                <ThemedText type="title">{localData.name}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#4CAF5020' : '#F4433620' }]}>
                  <ThemedText style={{ color: isOpen ? '#4CAF50' : '#F44336', fontWeight: 'bold', fontSize: 12 }}>
                    {isOpen ? 'ABIERTO' : 'CERRADO'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.description}>{localData.description}</ThemedText>

              <View style={styles.statsRow}>
                <View style={[styles.stat, { backgroundColor: colors.secondary + '30' }]}>
                  <Ionicons name="star" size={16} color={colors.primary} />
                  <ThemedText style={styles.statText}>{localData.rating} ({localData.reviewCount})</ThemedText>
                </View>
                <View style={[styles.stat, { backgroundColor: colors.secondary + '30' }]}>
                  <Ionicons name="time" size={16} color={colors.primary} />
                  <ThemedText style={styles.statText}>{localData.hours.open} - {localData.hours.close}</ThemedText>
                </View>
              </View>
            </View>

            {/* Quick Actions / Features */}
            {(localData.hasReservations || localData.hasPreOrder) && (
              <View style={styles.featuresSection}>
                <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Acciones Rápidas</ThemedText>
                <View style={styles.featuresRow}>
                  {localData.hasReservations && (
                    <Pressable 
                      style={[styles.featureButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                      onPress={() => setReservationModal(true)}
                    >
                      <Ionicons name="calendar" size={20} color={colors.primary} />
                      <ThemedText style={[styles.featureButtonText, { color: colors.primary }]}>Reservar</ThemedText>
                    </Pressable>
                  )}
                  {localData.hasPreOrder && (
                    <Pressable 
                      style={[styles.featureButton, { backgroundColor: '#4CAF5015', borderColor: '#4CAF50' }]}
                      onPress={() => setPreOrderModal(true)}
                    >
                      <Ionicons name="cart" size={20} color="#4CAF50" />
                      <ThemedText style={[styles.featureButtonText, { color: '#4CAF50' }]}>Pedir Ya</ThemedText>
                    </Pressable>
                  )}
                </View>
              </View>
            )}


            {/* Menú */}
            <View style={styles.section}>
              <ThemedText type="subtitle">Menú Sugerido</ThemedText>
              {localData.menu.length > 0 ? localData.menu.map((item) => (
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
              {localData.reviews.map((rev) => (
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
                  LocalsController.addReview(localData.id, rating, review);
                  // Actualizamos estado local para reflejar cambio inmediato
                  setLocalData({ ...LocalsController.getFeaturedLocals().find(l => l.id === localData.id)! });
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

        {/* Reservation Modal */}
        <Modal
          visible={reservationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setReservationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Reservar Mesa</ThemedText>
                <Pressable onPress={() => setReservationModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>
              
              <View style={styles.modalBody}>
                <ThemedText style={styles.modalLabel}>¿Cuántas personas?</ThemedText>
                <View style={styles.counterRow}>
                  <Pressable 
                    style={[styles.counterBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => setGuests(Math.max(1, guests - 1))}
                  >
                    <Ionicons name="remove" size={20} color={colors.primary} />
                  </Pressable>
                  <ThemedText style={styles.counterValue}>{guests}</ThemedText>
                  <Pressable 
                    style={[styles.counterBtn, { backgroundColor: colors.secondary }]}
                    onPress={() => setGuests(guests + 1)}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </Pressable>
                </View>

                <ThemedText style={styles.modalLabel}>Horario (estimado)</ThemedText>
                <View style={[styles.inputPlaceholder, { backgroundColor: colors.surface }]}>
                  <ThemedText>Hoy, 20:00</ThemedText>
                  <Ionicons name="time-outline" size={20} color={colors.icon} />
                </View>

                {localData.reservationPolicy && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="information-circle" size={18} color={colors.primary} />
                    <ThemedText style={styles.infoText}>{localData.reservationPolicy}</ThemedText>
                  </View>
                )}
              </View>

              <Pressable 
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleReservation}
              >
                <ThemedText style={styles.confirmText}>Confirmar Reserva</ThemedText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Pre-Order Modal */}
        <Modal
          visible={preOrderModal}
          transparent
          animationType="slide"
          onRequestClose={() => setPreOrderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText type="subtitle">Pedir mientras voy</ThemedText>
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Estará listo cuando llegues</ThemedText>
                </View>
                <Pressable onPress={() => setPreOrderModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                {localData.menu.map(item => (
                  <Pressable 
                    key={item.id} 
                    style={[
                      styles.orderItem, 
                      { borderColor: orderItems.includes(item.id) ? colors.primary : colors.secondary + '40' }
                    ]}
                    onPress={() => toggleOrderItem(item.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                      <ThemedText style={styles.menuDesc}>${item.price}</ThemedText>
                    </View>
                    <View style={[
                      styles.checkBox, 
                      { 
                        backgroundColor: orderItems.includes(item.id) ? colors.primary : 'transparent',
                        borderColor: colors.primary
                      }
                    ]}>
                      {orderItems.includes(item.id) && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.orderFooter}>
                <View style={styles.totalRow}>
                  <ThemedText>Total estimado:</ThemedText>
                  <ThemedText type="subtitle" style={{ color: colors.primary }}>
                    ${orderItems.reduce((acc, id) => acc + (localData.menu.find(m => m.id === id)?.price || 0), 0)}
                  </ThemedText>
                </View>
                <Pressable 
                  style={[styles.confirmButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handlePreOrder}
                >
                  <ThemedText style={styles.confirmText}>Pedir Ahora</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>


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
    </KeyboardAvoidingView>
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
  featuresSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 12,
    opacity: 0.8,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
  },
  featureButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBody: {
    gap: 15,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginVertical: 10,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
  },
  confirmButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalScroll: {
    marginTop: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderFooter: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

