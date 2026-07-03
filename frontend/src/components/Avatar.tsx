import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius } from '../theme';

type Props = {
  uri?: string | null;
  initials?: string | null;
  color?: string | null;
  size?: number;
  testID?: string;
};

export default function Avatar({ uri, initials, color, size = 56, testID }: Props) {
  const s = { width: size, height: size, borderRadius: size / 2 } as const;
  const bg = color || colors.brandTertiary;
  if (uri) {
    return (
      <Image
        testID={testID}
        source={{ uri }}
        style={[s, { backgroundColor: colors.surfaceTertiary }]}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View testID={testID} style={[s, styles.initials, { backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
