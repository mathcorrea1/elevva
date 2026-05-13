/**
 * MotiShim — implementação real de animações usando react-native-reanimated.
 *
 * Substitui o placeholder anterior (que era um <View> sem animação) por um
 * Animated.View totalmente funcional. Suporta:
 *   - mount animations: from + animate + transition
 *   - reactive animations: animate muda → transita do valor atual ao novo
 *   - loop animations: transition.loop = true
 *   - spring e timing, com delay e amortecimento configuráveis
 *   - opacity, translateX, translateY, scale, width, height
 *   - backgroundColor (mudança instantânea quando animate.backgroundColor muda)
 */

import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';
import type { ReactNode } from 'react';

type AnimatableProps = {
  opacity?: number;
  translateY?: number;
  translateX?: number;
  scale?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
};

type TransitionConfig = {
  type?: 'spring' | 'timing';
  duration?: number;
  delay?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
  loop?: boolean;
  repeatReverse?: boolean;
};

export type MotiViewProps = ViewProps & {
  from?: AnimatableProps;
  animate?: AnimatableProps;
  transition?: TransitionConfig;
  exit?: AnimatableProps;
  children?: ReactNode;
};

export const MotiView = ({
  from,
  animate,
  transition = {},
  style,
  children,
  ...rest
}: MotiViewProps) => {
  const {
    type = 'timing',
    duration = 400,
    delay = 0,
    damping = 15,
    stiffness = 300,
    mass = 1,
    loop = false,
    repeatReverse = true,
  } = transition;

  // Inicializa cada SharedValue no valor "from" (ou no valor "animate" se não houver "from")
  const opacity    = useSharedValue(from?.opacity    ?? (animate?.opacity    ?? 1));
  const translateY = useSharedValue(from?.translateY ?? 0);
  const translateX = useSharedValue(from?.translateX ?? 0);
  const scale      = useSharedValue(from?.scale      ?? 1);
  // -1 significa "não controla este eixo" (usa o valor do style estático)
  const width      = useSharedValue(from?.width      !== undefined ? from.width  : (animate?.width  ?? -1));
  const height     = useSharedValue(from?.height     !== undefined ? from.height : (animate?.height ?? -1));

  useEffect(() => {
    const run = (target: number) => {
      const base =
        type === 'spring'
          ? withSpring(target, { damping, stiffness, mass })
          : withTiming(target, { duration, easing: Easing.out(Easing.quad) });

      const cycled = loop ? withRepeat(base, -1, repeatReverse) : base;
      return delay > 0 ? withDelay(delay, cycled) : cycled;
    };

    if (animate?.opacity    !== undefined) opacity.value    = run(animate.opacity);
    if (animate?.translateY !== undefined) translateY.value = run(animate.translateY);
    if (animate?.translateX !== undefined) translateX.value = run(animate.translateX);
    if (animate?.scale      !== undefined) scale.value      = run(animate.scale);
    if (animate?.width      !== undefined && animate.width  >= 0) width.value  = run(animate.width);
    if (animate?.height     !== undefined && animate.height >= 0) height.value = run(animate.height);
  }, [
    animate?.opacity, animate?.translateY, animate?.translateX,
    animate?.scale, animate?.width, animate?.height,
    type, duration, delay, damping, stiffness, mass, loop, repeatReverse,
  ]);

  const animStyle = useAnimatedStyle(() => {
    const s: Record<string, unknown> = {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
    if (width.value  >= 0) s.width  = width.value;
    if (height.value >= 0) s.height = height.value;
    return s;
  });

  // backgroundColor não é animado (muda instantaneamente ao re-render)
  // A animação de largura já indica claramente o item ativo
  const bgStyle = animate?.backgroundColor
    ? ({ backgroundColor: animate.backgroundColor } as const)
    : undefined;

  return (
    <Animated.View style={[style, bgStyle, animStyle]} {...rest}>
      {children}
    </Animated.View>
  );
};

export default MotiView;
