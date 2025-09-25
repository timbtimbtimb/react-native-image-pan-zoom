import type { GestureResponderEvent } from 'react-native';
import type { Position } from './types';

export default function getTouchesCenter(
  event: GestureResponderEvent
): Position {
  const [a, b] = event.nativeEvent.touches;
  if (a == null || b == null) return { x: 0, y: 0 };
  const xCenter = (a.pageX + b.pageX) / 2;
  const yCenter = (a.pageY + b.pageY) / 2;
  return { x: xCenter, y: yCenter };
}
