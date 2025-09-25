import { View, StyleSheet, Image } from 'react-native';
import ViewPanZoom from '@snowmap.fr/react-native-view-pan-zoom';
import { useState } from 'react';

const images = [
  'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg',
  'https://images.pexels.com/photos/1666012/pexels-photo-1666012.jpeg',
  'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg',
  'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
];

export default function App() {
  const [index, setIndex] = useState<number>(0);

  const elements = images.map((image, n) => {
    return (
      <ViewPanZoom
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
    <View
      style={{
        ...styles.container,
        transform: [{ translateX: `${-100 * index}%` }],
      }}
    >
      {elements}
    </View>
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
