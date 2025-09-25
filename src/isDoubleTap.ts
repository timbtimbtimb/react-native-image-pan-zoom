import type { RefObject } from 'react';
import type { GestureResponderEvent } from 'react-native';

export default function isDoubleTap(
  event: GestureResponderEvent,
  tapHistory: RefObject<number[]>
) {
  if (
    event.nativeEvent.changedTouches.length !== 1 ||
    event.nativeEvent.touches.length !== 0
  ) {
    return false;
  }

  tapHistory.current = [...tapHistory.current, event.timeStamp];

  const start = tapHistory.current.at(-4);
  const end = tapHistory.current.at(-1);

  if (start == null || end == null) return false;

  if (end - start >= 300) return false;

  return true;
}
