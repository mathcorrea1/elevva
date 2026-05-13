import React from 'react';
import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { MotiView } from '@/components/system/MotiShim';

import { KeyboardAvoiding } from '@/components/layout/KeyboardAvoiding';
import { theme } from '@/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}

const heights = { sm: '35%', md: '50%', lg: '70%', fullscreen: '100%' } as const;

export const Modal = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  animationType = 'fade',
}: ModalProps) => (
  <RNModal transparent visible={visible} animationType={animationType} onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
    <KeyboardAvoiding>
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 280 }}
        style={[styles.content, { height: heights[size] }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showCloseButton ? (
            <Pressable onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          ) : null}
        </View>
        {children}
      </MotiView>
    </KeyboardAvoiding>
  </RNModal>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    marginTop: 'auto',
    backgroundColor: '#fff',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fonts.primaryBold,
    color: theme.colors.text,
  },
});

export default Modal;

