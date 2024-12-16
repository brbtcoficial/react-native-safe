import { Dimensions, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  padding30: {
    padding: 30,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  fakeView: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    width: '100%',
    height: 70,
    backgroundColor: 'red',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: '8%',
    paddingBottom: 80,
  },
  headerTitle: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  cameraMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  cameraMaskContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  connectionStatusContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
});

export default styles;
