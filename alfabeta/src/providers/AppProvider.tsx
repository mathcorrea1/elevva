import React from 'react';
import { View } from 'react-native';
import type { ReactNode } from 'react';

import { Toast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/app.store';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const toast = useAppStore((state) => state.toast);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {toast ? (
        <Toast message={toast.message} type={toast.type} duration={toast.duration} position={toast.position} />
      ) : null}
    </View>
  );
};
