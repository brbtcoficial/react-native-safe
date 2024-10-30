## Caso de uso

Você pode utilizar nossa biblioteca gratuitamente para obter o token [DeviceCheck](https://developer.apple.com/documentation/devicecheck) (iOS) e [PlayIntegrity](https://developer.android.com/google/play/integrity/overview) (Android). Se desejar, pode utilizar nosso [serviço de validação](https://safe.b8.com.br/#integration) de integridade de dipositivos (iOS e Android) para obter um veredito.

## Exemplos

### 1 - Token de integridade

Importe o método `getIntegrityToken`.
```js
import { getIntegrityToken } from '@b8safe/react-native-safe';
```

### 2 - Sintaxe

```js
await getIntegrityToken()
await getIntegrityToken(payload)
await getIntegrityToken(payload, type)
```

### 3 - Parametros

`payload` - opcional
- [Android] Caso precise, você pode assinar dados junto com a validação de integridade do dispositivo (apenas para token do tipo `classic`).
- [iOS] O Veredito de integridado oferecido pela Apple não possui muitos detalhes do dispositivo, porém é possível utilizar 2 bits como flags, que servem para identificar o que quiser. Veja a [documentação](https://developer.apple.com/documentation/devicecheck) para mais detalhes.
