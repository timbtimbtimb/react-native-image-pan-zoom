import type { RefObject } from 'react';
import type { GestureResponderEvent } from 'react-native';

export interface TapHistoryItem {
  timestamp: number;
  direction: 'on' | 'off';
}

export default function handleDoubleTap(
  event: GestureResponderEvent,
  tapHistory: RefObject<TapHistoryItem[]>
) {
  if (
    event.nativeEvent.changedTouches.length !== 1 ||
    event.nativeEvent.touches.length !== 0
  ) {
    return false;
  }

  tapHistory.current = [
    ...tapHistory.current,
    {
      timestamp: event.timeStamp,
      direction: 'off',
    },
  ];

  if (
    tapHistory.current.at(-1)?.direction !== 'off' ||
    tapHistory.current.at(-2)?.direction !== 'on' ||
    tapHistory.current.at(-3)?.direction !== 'off' ||
    tapHistory.current.at(-4)?.direction !== 'on'
  ) {
    return false;
  }

  const start = tapHistory.current.at(-4)?.timestamp;
  const end = tapHistory.current.at(-1)?.timestamp;

  if (start == null || end == null) return false;

  if (end - start >= 300) return false;

  return true;
}
