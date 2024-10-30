## Caso de uso

Você pode implementar diretamente a lógica de conexão diretamente em seu layout com a personalização que desejar, caso não queira utilizar o layout padrão.

## 1 - Provider

Você precisará adicionar o `Provider` na raíz do seu projeto.

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

## 2 - Câmera

Existem 2 tipos de serviços que podem ser consumidos com a câmera:

### Leitura de documentos (OCR);

Para utilizar essa funcionalidade, você deverá servir uma rota para seu app que retorne o `hash` obtido na [API B8Safe](https://safe.b8.com.br).

```js
import React, { useEffect, useCallback } from 'react';
import { CameraOCR, FinishCallCallback } from 'react-native-b8safe';

const CameraScreen = () => {
    const [hash, setHash] = useState('');

    const getHash = async () => {
        const response = await fetch('my/endpoint', {
            method:'POST',
            body: JSON.stringify({data:'exemplo'})
        });
        if(response.success) setHash(response.hash);
    }

    useEffect(() => {
        getHash();
    }, []);

    const handleSuccess = useCallback((data: FinishCallCallback) => {
        /**
         * Aqui você pode manipular a resposta de sucesso, e redirecionar para o próximo passo.
         */
    }, []);

    const handleError = useCallback((data: FinishCallCallback) => {
        /**
         * Aqui você pode manipular a resposta de erro, e redirecionar para a primeira tela, ou para o passo anterior.
         */
    }, []);

    const handleGoBack = useCallback(() => {
        /**
         * Essa função será disparada ao tocar o botão de `voltar` no header do HUD da câmera,
         * se nenhuma mascara customizada for oferecida.
         */
    }, []);

    return hash ? <CameraOCR hash={hash}
        title="Frente do documento"
        onSuccess={handleSuccess}
        goBack={handleGoBack}
        onError={handleError}>
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text>Máscara customizada</Text>
        </View>
    </CameraOCR> : <View style={{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }}>
        <Text>Carregando hash....</Text>
    </View>
}
```

| Propriedade             |               Tipo               | Obrigatório |                                           Descrição                                           |
| :------------------- | :------------------------------: | :------: | :---------------------------------------------------------------------------------------------: |
| children             |            ReactNode             |          | Caso queira customizar o HUD da câmera, você poderá renderizar seu componente React como filho. |
| hash                 |              string              |    \*    |                           Hash da validação, obtido na API da B8Safe.                           |
| title                |              string              |          |                                   Título da página da câmera.                                   |
| titleStyle           |            TextStyle             |          |                          Objeto contendo o estilo do texto do título.                           |
| showConnectionStatus |             boolean              |          |                          Mostrar/Ocultar o ícone de status de conexão.                          |
| goBack               |            () => void            |          |          Função disparada ao clicar no botão de `voltar`, na mascara padrão da câmera.          |
| onMessage            | (data:{message: string}) => void |          |        Função disparada quando uma mensagem do backend deve ser mostrada para o usuário.        |
| onSuccess            |  (data:FinishCallData) => void   |          |                    Função disparada quando o passo é concluído com sucesso.                     |
| onError              |  (data:FinishCallData) => void   |          |                 Função disparada quando há um erro na execução do passo atual.                  |

### Leitura facial 3D;
