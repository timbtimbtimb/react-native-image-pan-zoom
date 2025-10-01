import {
  Animated,
  Image,
  StyleSheet,
  type LayoutRectangle,
} from 'react-native';
import ViewPanZoom, { type ViewPanZoomRef } from './ViewPanZoom';
import {
  type Dispatch,
  type ReactElement,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { SwipeDirection } from './types';

interface Props {
  images: string[];
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
}

export default function ViewPanCarousel({
  images,
  index,
  setIndex,
}: Props): ReactElement {
  const containerDimensions = useRef<LayoutRectangle>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const viewPanZoomRefs = useRef<ViewPanZoomRef[]>([]);

  useEffect(() => {
    if (viewPanZoomRefs.current == null) return;
    viewPanZoomRefs.current[index]?.reset();
    viewPanZoomRefs.current[index - 1]?.reset();
    viewPanZoomRefs.current[index + 1]?.reset();
  }, [index]);

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
      setIndex((prev: number) => {
        if (direction === 'up' || direction === 'down') return prev;
        const increment = direction === 'right' ? -1 : 1;
        const newIndex = prev + increment;
        if (newIndex < 0 || newIndex > images.length - 1) return prev;
        return newIndex;
      });
    },
    [images, setIndex]
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
}

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
