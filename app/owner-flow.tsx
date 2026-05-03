import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TextInput, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OwnerFlowScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];

  const [isRegistered, setIsRegistered] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    category: '',
  });

  const handleRegister = () => {
    if (!form.name || !form.address) {
      Alert.alert('Faltan datos', 'Por favor ingresa al menos el nombre y la dirección del local.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRegistered(true);
  };

  if (isRegistered) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <ThemedText type="title">Panel de Dueño</ThemedText>
          <Pressable onPress={() => setIsRegistered(false)}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">Resumen de &quot;{form.name}&quot;</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <ThemedText style={styles.statValue}>1,240</ThemedText>
              <ThemedText style={styles.statLabel}>Vistas de Perfil</ThemedText>
              <Ionicons name="eye-outline" size={20} color={colors.primary} style={styles.statIcon} />
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <ThemedText style={styles.statValue}>4.8</ThemedText>
              <ThemedText style={styles.statLabel}>Rating Promedio</ThemedText>
              <Ionicons name="star-outline" size={20} color={colors.primary} style={styles.statIcon} />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Reseñas Recientes</ThemedText>
            <ThemedText style={{ color: colors.primary }}>Ver todas</ThemedText>
          </View>

          {[1, 2].map(i => (
            <View key={i} style={[styles.miniReview, { backgroundColor: colors.surface }]}>
              <View style={styles.reviewHeader}>
                <ThemedText type="defaultSemiBold">Usuario {i}</ThemedText>
                <View style={styles.stars}>
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <ThemedText style={styles.starText}>5.0</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.reviewPreview}>{"Excelente atención y la comida llegó súper caliente..."}</ThemedText>
            </View>
          ))}

          <Pressable 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible en la versión 2.0')}
          >
            <ThemedText style={styles.submitButtonText}>Gestionar Menú</ThemedText>
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <ThemedText type="title">Tu Local</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoBox, { backgroundColor: colors.secondary + '20' }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <ThemedText style={[styles.infoText, { color: colors.primary }]}>
            Registra tu local para que miles de usuarios puedan visitarte.
          </ThemedText>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nombre del Local</ThemedText>
          <TextInput
            placeholder="Ej: La Parrilla de Juan"
            placeholderTextColor={colors.icon}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={form.name}
            onChangeText={(t) => setForm({...form, name: t})}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Descripción</ThemedText>
          <TextInput
            placeholder="Cuéntanos qué ofreces..."
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={form.description}
            onChangeText={(t) => setForm({...form, description: t})}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Ubicación / Dirección</ThemedText>
          <TextInput
            placeholder="Calle, Ciudad, Provincia"
            placeholderTextColor={colors.icon}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={form.address}
            onChangeText={(t) => setForm({...form, address: t})}
          />
        </View>

        <ThemedText style={styles.label}>Fotos del Local y Comida</ThemedText>
        <View style={styles.photoContainer}>
          <Pressable 
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.secondary, borderStyle: 'dashed' }]}
          >
            <Ionicons name="camera" size={30} color={colors.primary} />
            <ThemedText style={{ color: colors.primary, fontSize: 12 }}>Añadir Foto</ThemedText>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleRegister}
        >
          <ThemedText style={styles.submitButtonText}>Guardar y Publicar</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  photoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniReview: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewPreview: {
    fontSize: 13,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
