import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Switch } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAppContext } from '@/src/context/AppContext';

export default function SettingsScreen() {
  const { themePreference, setThemePreference } = useAppContext();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [notifications, setNotifications] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Preferencias</ThemedText>
          
          <View style={[styles.settingRow, { borderBottomColor: colors.secondary + '20' }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <ThemedText style={styles.settingLabel}>Notificaciones</ThemedText>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.secondary + '20' }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <ThemedText style={styles.settingLabel}>Ubicación</ThemedText>
            </View>
            <Switch 
              value={location} 
              onValueChange={setLocation}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={location ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Apariencia</ThemedText>
          <View style={[styles.themeContainer, { backgroundColor: colors.surface, borderColor: colors.secondary + '20' }]}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.themeOption,
                  themePreference === mode && { backgroundColor: colors.primary }
                ]}
                onPress={() => setThemePreference(mode)}
              >
                <Ionicons 
                  name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'settings'} 
                  size={18} 
                  color={themePreference === mode ? 'white' : colors.primary} 
                />
                <ThemedText style={[
                  styles.themeOptionText,
                  themePreference === mode && { color: 'white', fontWeight: 'bold' }
                ]}>
                  {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Sistema'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Cuenta</ThemedText>
          
          <Pressable style={[styles.settingRow, { borderBottomColor: colors.secondary + '20' }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="person" size={20} color={colors.primary} />
              <ThemedText style={styles.settingLabel}>Editar Perfil</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>

          <Pressable style={[styles.settingRow, { borderBottomColor: colors.secondary + '20' }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <ThemedText style={styles.settingLabel}>Métodos de Pago</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable style={styles.logoutButton}>
            <ThemedText style={styles.logoutText}>Cerrar Sesión</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  themeContainer: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    marginTop: 5,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 13,
  },
});
