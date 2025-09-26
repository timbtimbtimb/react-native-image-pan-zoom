import {
  StyleSheet,
  Image,
  Animated,
  type LayoutRectangle,
} from 'react-native';
import ViewPanZoom, { type ViewPanZoomRef } from './ViewPanZoom';
import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  type ReactElement,
  useCallback,
  useMemo,
} from 'react';
import type { SwipeDirection } from './types';

export type ViewPanCarouselRef = {
  index: number;
  setIndex: (index: number) => void;
};

const ViewPanCarousel = forwardRef<
  ViewPanCarouselRef,
  { images: string[]; onIndexChange?: (index: number) => any }
>(({ images, onIndexChange }, ref): ReactElement => {
  const [index, setIndex] = useState<number>(0);
  const containerDimensions = useRef<LayoutRectangle>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const viewPanZoomRefs = useRef<ViewPanZoomRef[]>([]);

  useImperativeHandle(ref, () => ({
    index,
    setIndex: (i: number) => {
      if (i >= images.length || i < 0) return;
      setIndex(i);
    },
  }));

  useEffect(() => {
    onIndexChange?.(index);
    if (viewPanZoomRefs.current == null) return;
    viewPanZoomRefs.current[index]?.reset();
    viewPanZoomRefs.current[index - 1]?.reset();
    viewPanZoomRefs.current[index + 1]?.reset();
  }, [index, onIndexChange]);

  useEffect(() => {
    if (containerDimensions.current == null) return;

    Animated.timing(translateX, {
      toValue: index * containerDimensions.current.width * -1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [index, translateX]);

  const onSwipe = useCallback(
    (direction: SwipeDirection) => {
      setIndex((prev) => {
        if (direction === 'up' || direction === 'down') return prev;
        const increment = direction === 'right' ? -1 : 1;
        const newIndex = prev + increment;
        if (newIndex < 0 || newIndex > images.length - 1) return prev;
        return newIndex;
      });
    },
    [images]
  );

  const elements = useMemo(() => {
    return images.map((image, n) => {
      return (
        <ViewPanZoom
          ref={(r) => {
            if (r == null) return;
            viewPanZoomRefs.current[n] = r;
          }}
          key={image + n}
          onSwipe={onSwipe}
        >
          <Image
            source={{
              uri: image,
            }}
            onError={console.error}
            resizeMode={'contain'}
            style={styles.image}
          />
        </ViewPanZoom>
      );
    });
  }, [images, onSwipe]);

  return (
    <Animated.View
      style={{
        ...styles.container,
        transform: [{ translateX }],
      }}
      onLayout={(event) => {
        containerDimensions.current = event.nativeEvent.layout;
      }}
    >
      {elements}
    </Animated.View>
  );
});

export default ViewPanCarousel;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
