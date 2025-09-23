import { View, StyleSheet } from 'react-native';
import ImagePanZoom from '@snowmap/react-native-image-pan-zoom';

export default function App() {
  return (
    <View style={styles.container}>
      <ImagePanZoom source="https://images.pexels.com/photos/31001122/pexels-photo-31001122.jpeg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
