## Installation

### Dependencies

Verifique se as dependencias abaixo estão corretamente instaladas e configuradas. Em caso de dúvidas, acesse diretamente os repositório das dependencias.

- [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc)
- [react-native-sha256](https://github.com/itinance/react-native-sha256)
- [react-native-permissions](https://github.com/zoontek/react-native-permissions)
- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)
- [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/docs/getting-started/installation)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-svg](https://github.com/software-mansion/react-native-svg?tab=readme-ov-file#installation)

#### Install command

```sh
npm install @b8safe/react-native-safe
```

### iOS Setup

Depois de instalar a biblioteca, adicione a seguinte linha dentro do target do arquivo `ios/Podfile`:

```Pod
pod '@b8safe/react-native-safe' , :path => '../node_modules/@b8safe/react-native-safe'
```

### Android Setup

Depois de instalar a biblioteca, adicione o código abaixo no arquivo `android/settings.gradle`:

```
    ...

    include ':@b8safe_react-native-safe'
    project(':@b8safe_react-native-safe').projectDir = new File(rootProject.projectDir, '../node_modules/@b8safe/react-native-safe/android')
    
    ...
```