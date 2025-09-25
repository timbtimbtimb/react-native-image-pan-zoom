import {
  ViewPanCarousel,
  type ViewPanCarouselRef,
} from '@snowmap.fr/react-native-view-pan-zoom';
import { useCallback, useEffect, useRef } from 'react';

const images = [
  'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg',
  'https://images.pexels.com/photos/1666012/pexels-photo-1666012.jpeg',
  'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg',
  'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
];

export default function App() {
  const ref = useRef<ViewPanCarouselRef>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Back to index 0!');
      ref.current?.setIndex(0);
    }, 3000);

    return () => clearInterval(interval);
  });

  const onIndexChange = useCallback((index: number) => {
    console.log(`Switched to index ${index}.`);
  }, []);

  return (
    <ViewPanCarousel images={images} ref={ref} onIndexChange={onIndexChange} />
  );
}
