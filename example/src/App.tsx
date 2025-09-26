import {
  ViewPanCarousel,
  type ViewPanCarouselRef,
} from '@snowmap.fr/react-native-view-pan-zoom';
import { useCallback, useRef } from 'react';
import { Button, Platform, StyleSheet, View } from 'react-native';

const images = [
  'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg',
  'https://images.pexels.com/photos/1666012/pexels-photo-1666012.jpeg',
  'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg',
  'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
];

export default function App() {
  const ref = useRef<ViewPanCarouselRef>(null);

  const onIndexChange = useCallback((index: number) => {
    console.log(`Switched to index ${index}.`);
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <View style={{ ...styles.button, ...styles.prevButton }}>
          <Button
            title="Previous"
            onPress={() => {
              if (ref.current == null) return;
              ref.current.setIndex(ref.current.index - 1);
            }}
          />
        </View>
      )}
      <ViewPanCarousel
        images={images}
        ref={ref}
        onIndexChange={onIndexChange}
      />
      {Platform.OS === 'web' && (
        <View style={{ ...styles.button, ...styles.nextButton }}>
          <Button
            title="Next"
            onPress={() => {
              if (ref.current == null) return;
              ref.current.setIndex(ref.current.index + 1);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },
  button: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
  },
  prevButton: {
    left: 0,
  },
  nextButton: {
    right: 0,
  },
});
