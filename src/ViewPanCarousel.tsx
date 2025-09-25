import { StyleSheet, Image, Animated, Dimensions } from 'react-native';
import ViewPanZoom, { type ViewPanZoomRef } from './ViewPanZoom';
import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  type ReactElement,
} from 'react';

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
    setIndex: (n: number) => {
      setIndex(n);
    },
  }));

  useEffect(() => {
    onIndexChange?.(index);
    viewPanZoomRefs.current?.forEach((r) => r.reset());
  }, [index, onIndexChange]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: index * width * -1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [index, translateX, width]);

  const elements = images.map((image, n) => {
    return (
      <ViewPanZoom
        ref={(r) => {
          if (r == null) return;
          viewPanZoomRefs.current.push(r);
        }}
        key={image + n}
        onSwipe={(direction) => {
          setIndex((prev) => {
            if (direction === 'up' || direction === 'down') return prev;
            const increment = direction === 'right' ? -1 : 1;
            const newIndex = prev + increment;
            if (newIndex < 0 || newIndex > images.length - 1) return prev;
            return newIndex;
          });
        }}
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
