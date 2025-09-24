import { useCallback, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

type Position = {
  x: number;
  y: number;
};

export default function ImagePanZoom({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const tapHistory = useRef<
    Array<{ timestamp: number; direction: 'on' | 'off' }>
  >([]);

  const touchesStartSize = useRef<number>(1);
  const startScale = useRef<number>(1);
  const currentScale = useRef<number>(1);

  const scale = useRef(new Animated.Value(1)).current;
  const center = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const touchesStartCenter = useRef<Position>({ x: 0, y: 0 });
  const startCenter = useRef<Position>({ x: 0, y: 0 });
  const currentCenter = useRef<Position>({ x: 0, y: 0 });

  const reset = useCallback(() => {
    startScale.current = 1;
    currentScale.current = 1;

    startCenter.current = { x: 0, y: 0 };
    currentCenter.current = { x: 0, y: 0 };

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(center, {
        toValue: { x: 0, y: 0 },
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    tapHistory.current = [];
  }, [scale, center]);

  const onPanResponderStart = useCallback((event: GestureResponderEvent) => {
    if (event.nativeEvent.touches[0] == null) return;

    if (event.nativeEvent.touches.length === 1) {
      tapHistory.current = [
        ...tapHistory.current,
        {
          timestamp: event.timeStamp,
          direction: 'on',
        },
      ];

      touchesStartCenter.current = {
        x: event.nativeEvent.touches[0].pageX,
        y: event.nativeEvent.touches[0].pageY,
      };
    }

    if (event.nativeEvent.touches.length === 2) {
      touchesStartSize.current = getTouchesSize(event);
      touchesStartCenter.current = getTouchesCenter(event);
    }
  }, []);

  const onPanResponderMove = useCallback(
    (event: GestureResponderEvent) => {
      if (event.nativeEvent.touches.length === 1) {
        const centerDelta = getTouchesCenterDelta(
          event,
          touchesStartCenter.current
        );
        const scaledCenterDelta = {
          x: centerDelta.x / currentScale.current,
          y: centerDelta.y / currentScale.current,
        };

        currentCenter.current = {
          x: startCenter.current.x + scaledCenterDelta.x,
          y: startCenter.current.y + scaledCenterDelta.y,
        };

        center.setValue(currentCenter.current);
      }

      if (event.nativeEvent.touches.length === 2) {
        const touchesSize = getTouchesSize(event);
        const ratio = touchesSize / touchesStartSize.current;
        currentScale.current = startScale.current * ratio;
        scale.setValue(currentScale.current);

        const touchesCenter = getTouchesCenter(event);
        const centerDelta = {
          x: touchesCenter.x - touchesStartCenter.current.x,
          y: touchesCenter.y - touchesStartCenter.current.y,
        };
        currentCenter.current = {
          x: startCenter.current.x + centerDelta.x / currentScale.current,
          y: startCenter.current.y + centerDelta.y / currentScale.current,
        };
        center.setValue(currentCenter.current);
      }
    },
    [center, scale]
  );

  const onPanResponderRelease = useCallback(
    (event: GestureResponderEvent) => {
      if (
        event.nativeEvent.changedTouches.length === 1 &&
        event.nativeEvent.touches.length === 0
      ) {
        tapHistory.current = [
          ...tapHistory.current,
          {
            timestamp: event.timeStamp,
            direction: 'off',
          },
        ];

        if (
          tapHistory.current.at(-1)?.direction === 'off' &&
          tapHistory.current.at(-2)?.direction === 'on' &&
          tapHistory.current.at(-3)?.direction === 'off' &&
          tapHistory.current.at(-4)?.direction === 'on'
        ) {
          const start = tapHistory.current.at(-4)?.timestamp;
          const end = tapHistory.current.at(-1)?.timestamp;
          if (start == null || end == null) return;
          if (end - start < 300) {
            reset();
          }
        }
      }

      if (event.nativeEvent.touches.length === 1) {
        onPanResponderStart(event);
      }

      startCenter.current = currentCenter.current;
      startScale.current = currentScale.current;
    },
    [onPanResponderStart, reset]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderStart,
      onPanResponderMove,
      onPanResponderRelease,
    })
  );

  return (
    <View style={styles.container} {...panResponder.current.panHandlers}>
      <Animated.View
        style={{
          ...styles.container,
          transform: [{ scale }],
        }}
      >
        <Animated.View
          style={{
            ...styles.container,
            transform: [{ translateX: center.x }, { translateY: center.y }],
          }}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function getTouchesSize(event: GestureResponderEvent): number {
  const [a, b] = event.nativeEvent.touches;
  if (a == null || b == null) return 1;
  const xDistance = Math.abs(a.pageX - b.pageX);
  const yDistance = Math.abs(a.pageY - b.pageY);
  const diagonal = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
  return diagonal;
}

function getTouchesCenter(event: GestureResponderEvent): Position {
  const [a, b] = event.nativeEvent.touches;
  if (a == null || b == null) return { x: 0, y: 0 };
  const xCenter = (a.pageX + b.pageX) / 2;
  const yCenter = (a.pageY + b.pageY) / 2;
  return { x: xCenter, y: yCenter };
}

function getTouchesCenterDelta(
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
