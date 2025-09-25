import type { GestureResponderEvent } from 'react-native';
import type { Position } from './types';

export default function getTouchesCenterDelta(
  event: GestureResponderEvent,
  touchesStartCenter: Position
): Position {
  if (event.nativeEvent.touches[0] == null) return { x: 0, y: 0 };

  const touchesCenter = {
    x: event.nativeEvent.touches[0].pageX,
    y: event.nativeEvent.touches[0].pageY,
  };
  const centerDelta = {
    x: touchesCenter.x - touchesStartCenter.x,
    y: touchesCenter.y - touchesStartCenter.y,
  };

  return centerDelta;
}
