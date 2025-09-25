import { ViewPanCarousel } from '@snowmap.fr/react-native-view-pan-zoom';

const images = [
  'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg',
  'https://images.pexels.com/photos/1666012/pexels-photo-1666012.jpeg',
  'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg',
  'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
];

export default function App() {
  return <ViewPanCarousel images={images} />;
}
