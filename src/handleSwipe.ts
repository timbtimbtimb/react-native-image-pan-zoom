import type { PanResponderGestureState } from 'react-native';

type Directions = 'left' | 'right' | 'up' | 'down';

export type OnSwipe = (direction: Directions) => any;

export default function handleSwipe(
  gestureState: PanResponderGestureState,
  onSwipe: OnSwipe
) {
  const speed = Math.abs(gestureState.vx) + Math.abs(gestureState.vy);
  if (speed <= 1) return false;

  const directions: [Directions, number][] = [
    ['down', Math.abs(Math.max(0, gestureState.vy))],
    ['up', Math.abs(Math.min(0, gestureState.vy))],
    ['right', Math.abs(Math.max(0, gestureState.vx))],
    ['left', Math.abs(Math.min(0, gestureState.vx))],
  ];

  const sortedDirections = directions.sort((a, b) => b[1] - a[1]);
  const fastestDirection = sortedDirections[0]?.[0] as Directions;

  onSwipe(fastestDirection);
  return true;
}
