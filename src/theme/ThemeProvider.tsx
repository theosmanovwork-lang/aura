import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import {
  Appearance,
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { palettes, type ColorScheme, type Palette } from './colors';

const ThemeContext = createContext<ColorScheme | null>(null);

/** The scheme the phone is set to; a phone with no preference counts as light. */
function useSystemScheme(): ColorScheme {
  const scheme = useSyncExternalStore(
    (onChange) => {
      const subscription = Appearance.addChangeListener(onChange);
      return () => subscription.remove();
    },
    () => Appearance.getColorScheme(),
    // Rendered on a server (the static web export) there is no phone to ask: light until the page loads.
    () => 'light',
  );
  return scheme === 'dark' ? 'dark' : 'light';
}

type ThemeProviderProps = Readonly<{
  children: ReactNode;
  /** Forces a scheme for everything inside (the feed is always dark); without it the phone decides. */
  scheme?: ColorScheme;
}>;

export function ThemeProvider({ children, scheme }: ThemeProviderProps) {
  const system = useSystemScheme();
  return <ThemeContext.Provider value={scheme ?? system}>{children}</ThemeContext.Provider>;
}

/** The scheme in use here: a forced one from a ThemeProvider above, otherwise the phone's. */
export function useScheme(): ColorScheme {
  const forced = useContext(ThemeContext);
  const system = useSystemScheme();
  return forced ?? system;
}

/** The colours for the scheme in use. Works outside a ThemeProvider too (an error screen). */
export function useColors(): Palette {
  return palettes[useScheme()];
}

/**
 * Styles that depend on the colours. Write `const useStyles = makeStyles((colors) => ({ ... }))`
 * once per file and call `const styles = useStyles()` in the component.
 */
export function makeStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
  factory: (colors: Palette) => T,
): () => T {
  const cache = new Map<ColorScheme, T>();
  return function useStyles(): T {
    const scheme = useScheme();
    return useMemo(() => {
      const known = cache.get(scheme);
      if (known) return known;
      const created = StyleSheet.create(factory(palettes[scheme]));
      cache.set(scheme, created);
      return created;
    }, [scheme]);
  };
}
