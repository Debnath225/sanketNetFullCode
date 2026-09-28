import { Colors } from '@/constants/theme';
import { useSanket } from '@/context/SanketContext';
import { useColorScheme } from 'react-native';

export function useTheme() {
  try {
    const context = useSanket();
    if (context && context.theme) {
      return context.theme;
    }
  } catch {
    // Fallback if rendered outside provider
  }

  const scheme = useColorScheme();
  return scheme === 'light' ? Colors.light : Colors.dark;
}
