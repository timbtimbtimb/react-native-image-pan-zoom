import { StyleSheet, Image, Animated, Dimensions } from 'react-native';
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
  const translateX = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get('window').width;
  const viewPanZoomRefs = useRef<ViewPanZoomRef[]>([]);

  useImperativeHandle(ref, () => ({
    index,
    setIndex,
  }));

  useEffect(() => {
    onIndexChange?.(index);
    if (viewPanZoomRefs.current == null) return;
    viewPanZoomRefs.current[index]?.reset();
    viewPanZoomRefs.current[index - 1]?.reset();
    viewPanZoomRefs.current[index + 1]?.reset();
  }, [index, onIndexChange]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: index * width * -1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [index, translateX, width]);

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
