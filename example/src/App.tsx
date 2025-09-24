import { View, StyleSheet, Image } from 'react-native';
import ViewPanZoom from '@snowmap.fr/react-native-image-pan-zoom';

export default function App() {
  return (
    <View style={styles.container}>
      <ViewPanZoom>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/29857592/pexels-photo-29857592.jpeg',
          }}
          onError={console.error}
          resizeMode={'contain'}
          style={styles.image}
        />
      </ViewPanZoom>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
