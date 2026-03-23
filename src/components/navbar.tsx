import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface NavbarProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

const WEB_TAB_BAR_HEIGHT = 60;

export function Navbar({ title, subtitle, rightContent }: NavbarProps) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const topPadding = Platform.OS === 'web' ? WEB_TAB_BAR_HEIGHT : insets.top + 12;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPadding,
          backgroundColor: colors.background,
          borderBottomColor: colors.backgroundElement,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {rightContent ? <View style={styles.actions}>{rightContent}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
