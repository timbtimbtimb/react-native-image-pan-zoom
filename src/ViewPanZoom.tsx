import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import type {
  CursorValue,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import getTouchesSize from './getTouchesSize';
import getTouchesCenter from './getTouchesCenter';
import getTouchesCenterDelta from './getTouchesCenterDelta';
import isDoubleTap from './isDoubleTap';
import type { OnSwipe } from './handleSwipe';
import handleSwipe from './handleSwipe';
import type { Position } from './types';

export type ViewPanZoomRef = {
  reset: () => void;
};

const ViewPanZoom = forwardRef<
  ViewPanZoomRef,
  {
    onSwipe?: OnSwipe;
    children: ReactNode;
  }
>(({ onSwipe, children }, ref): ReactElement => {
  const containerRef = useRef(null);

  const tapHistory = useRef<number[]>([]);

  const touchesStartSize = useRef<number>(1);
  const startScale = useRef<number>(1);
  const currentScale = useRef<number>(1);

  const scale = useRef(new Animated.Value(1)).current;
  const center = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const touchesStartCenter = useRef<Position>({ x: 0, y: 0 });
  const startCenter = useRef<Position>({ x: 0, y: 0 });
  const currentCenter = useRef<Position>({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    reset,
  }));

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = containerRef.current;
    if (element == null) return;
    const typedElement: HTMLDivElement = element;

    const handleWheel = (e: WheelEvent) => {
      const factor = 0.05;
      const operation = e.deltaY > 0 ? 1 - factor : 1 + factor;
      const newScale = currentScale.current * operation;

      console.log({ newScale });

      startScale.current = newScale;
      currentScale.current = newScale;
      scale.setValue(newScale);
    };

    typedElement.addEventListener('wheel', handleWheel);

    return () => typedElement.removeEventListener('wheel', handleWheel);
  }, [ref, scale]);

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
      tapHistory.current = [...tapHistory.current, event.timeStamp];

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
      tapHistory.current = [];

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
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (isDoubleTap(event, tapHistory)) {
        reset();
        return;
      }

      if (
        Platform.OS !== 'web' &&
        event.nativeEvent.touches.length === 0 &&
        onSwipe != null
      ) {
        if (handleSwipe(gestureState, onSwipe)) {
          reset();
        }
      }

      if (event.nativeEvent.touches.length === 1) {
        onPanResponderStart(event);
      }

      startCenter.current = currentCenter.current;
      startScale.current = currentScale.current;
    },
    [onPanResponderStart, onSwipe, reset]
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
    <View
      ref={containerRef}
      style={styles.container}
      {...panResponder.current.panHandlers}
    >
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
});

export default ViewPanZoom;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    cursor: 'grab' as CursorValue,
  },
});
