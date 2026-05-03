import { DrawerActions, useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
        <View style={styles.drawerHeader}>
          <View style={[styles.profileImage, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <ThemedText type="defaultSemiBold" style={styles.userName}>Usuario Demo</ThemedText>
          <ThemedText style={styles.userEmail}>demo@dondecomer.com</ThemedText>
        </View>
        
        <View style={styles.drawerDivider} />
        
        <DrawerItemList {...props} />
        
      </DrawerContentScrollView>
      
      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.drawerDivider} />
        <ThemedText style={styles.footerText}>Donde Comer+ v1.1.0</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: colors.primary,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.secondary + '40',
        },
        headerRight: () => (
          <Pressable 
            onPress={() => router.push('/owner-flow')}
            style={{ marginRight: 15, padding: 5 }}
          >
            <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
          </Pressable>
        ),
        headerLeft: () => {
          const navigation = useNavigation();
          return (
            <Pressable 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginLeft: 15, padding: 5 }}
            >
              <Ionicons name="menu-outline" size={28} color={colors.primary} />
            </Pressable>
          );
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerLabelStyle: {
          marginLeft: -10,
          fontWeight: '600',
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Inicio',
          drawerIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
          headerTitle: 'Donde Comer+',
        }}
      />
      <Drawer.Screen
        name="reservations"
        options={{
          title: 'Mis Reservas',
          drawerIcon: ({ color }) => <Ionicons name="calendar" size={22} color={color} />,
          headerTitle: 'Mis Reservas',
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          title: 'Mis Pedidos',
          drawerIcon: ({ color }) => <Ionicons name="fast-food" size={22} color={color} />,
          headerTitle: 'Mis Pedidos',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Configuración',
          drawerIcon: ({ color }) => <Ionicons name="settings" size={22} color={color} />,
          headerTitle: 'Configuración',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 10,
  },
  drawerFooter: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 10,
  },
});
