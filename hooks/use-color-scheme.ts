import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useAppContext } from '@/src/context/AppContext';

export function useColorScheme() {
  const { themePreference } = useAppContext();
  const systemScheme = useNativeColorScheme();
  
  if (themePreference === 'system') {
    return systemScheme ?? 'light';
  }
  return themePreference;
}
