jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReanimated = require('react-native-reanimated/mock');
  mockReanimated.default.call = () => {};
  return mockReanimated;
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-linear-gradient', () => {
  // Native rendering is not available in Jest; retain children, events and accessibility props.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return { LinearGradient: require('react-native').View };
});
