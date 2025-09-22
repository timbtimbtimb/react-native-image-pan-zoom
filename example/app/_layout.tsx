import ImagePanZoom from "../../dist/ImagePanZoom";
import { View } from 'react-native'


export default function RootLayout() {
  return (
    <View>
      <ImagePanZoom source={'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?cs=srgb&dl=pexels-umkreisel-app-1459505.jpg&fm=jpg'} />
    </View>
  )
}
