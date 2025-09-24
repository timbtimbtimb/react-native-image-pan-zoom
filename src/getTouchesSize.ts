import type { GestureResponderEvent } from 'react-native';

export default function getTouchesSize(event: GestureResponderEvent): number {
  const [a, b] = event.nativeEvent.touches;
  if (a == null || b == null) return 1;
  const xDistance = Math.abs(a.pageX - b.pageX);
  const yDistance = Math.abs(a.pageY - b.pageY);
  const diagonal = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
  return diagonal;
}
