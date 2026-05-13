import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme';

interface AvatarProps {
  name: string;
  imageUri?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  borderColor?: string;
}

const sizes = { xs: 28, sm: 36, md: 48, lg: 64, xl: 88 };
const fontSizes = { xs: 11, sm: 13, md: 17, lg: 22, xl: 30 };

const palette = ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const hashColor = (name: string): string => {
  const hash = name.split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

export const Avatar = ({
  name,
  imageUri,
  size = 'md',
  showBorder = false,
  borderColor = theme.colors.primary[600],
}: AvatarProps) => {
  const [loading, setLoading] = useState(Boolean(imageUri));
  const dimension = sizes[size];
  const fontSize = fontSizes[size];
  const initials = useMemo(
    () =>
      name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [name],
  );

  return (
    <View
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth: showBorder ? 2.5 : 0,
          borderColor,
          backgroundColor: hashColor(name),
        },
      ]}
    >
      {imageUri ? (
        <>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : null}
          <Image
            source={{ uri: imageUri }}
            onLoadEnd={() => setLoading(false)}
            style={[styles.image, { borderRadius: dimension / 2 }]}
          />
        </>
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#fff',
    fontFamily: theme.typography.fonts.primaryBold,
    letterSpacing: 0.5,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
