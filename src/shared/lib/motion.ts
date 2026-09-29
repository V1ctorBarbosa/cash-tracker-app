import { Easing } from 'react-native-reanimated';

/** The one easing curve every animated transition in the app uses, so motion reads as one consistent system rather than a mix of defaults. */
export const StandardEasing = Easing.bezier(0.22, 0.8, 0.24, 1);
