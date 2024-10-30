# react-native-b8safe

SDK para integração dos serviços da B8Safe em aplicações React-Native.

##

## Installation
Detalhes sobre a instalação, consulte a [documentação](https://github.com/brbtcoficial/react-native-b8safe/blob/master/Documentation/Installation.md).
```sh
npm install @b8safe/react-native-safe
```

### Dependencies
Verifique se as dependencias da biblioteca estão devidamente instaladas e configuradas em seu projeto React. Em caso de dúvidas ou problemas com alguma dependência, acesse diretamente os repositórios:

- [react-native-sha256](https://github.com/itinance/react-native-sha256)
- [react-native-svg](https://github.com/software-mansion/react-native-svg?tab=readme-ov-file#installation)
- [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)
- [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/docs/getting-started/installation)
- [react-native-permissions](https://github.com/zoontek/react-native-permissions)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc)
- [react-native-worklets-core](https://github.com/margelo/react-native-worklets-core)

Dica: Verifique o passo a passo para a instalação de cada dependência, de acordo com as versões apontadas no arquivo [package.json](https://github.com/brbtcoficial/react-native-b8safe/blob/master/package.json).

## Basic Usage

Para começar, você precisará adicionar o Provider do serviço na raiz do seu projeto React, com sua aplicação inteira sendo elemento filho do `B8SafeProvider` 

```js
import React, { useCallback} from 'react';
import { B8SafeProvider } from 'react-native-b8safe';

const App = () => {
  const b8SafeReadyCallback = useCallback(() => {
    // device checker inicializado
  }, []);

  return (
    <B8SafeProvider 
      hashChecker="kvnDZt0331uPVxmW"
      onReady={b8SafeReadyCallback}>
      {/* Aqui dentro vão todos os componentes do seu app e/ou sistema de navegação */}
    </B8SafeProvider>
  );
};

export default App;
```

## Properties
| Parâmetro | Tipo | Obrigatório | Descrição |
| --------- | ---- | ------ | ---------- |
| hashChecker | string | \* | Hash checker da sua conta para a utilização dos nossos serviços*. |
| onReady | function |  | Função disparada quando a biblioteca termina de carregar todos os componentes importantes. |

* O atributo `hashChecker` é obrigatório e pode ser obtido diretamente no painel [B8safe](https://safe.b8.com.br/login).

## Contributing

- See [this](https://arunkumarvallal.medium.com/-become-a-pro-at-commit-messages-using-commitlint-56dab86333b3) if you dont know to work with commitlint.
See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.


## License

BSD-2-Clause