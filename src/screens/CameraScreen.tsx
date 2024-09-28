import {
  BlendMode,
  Canvas,
  createPicture,
  LinearGradient,
  Picture,
  Rect,
  Skia,
  vec,
  type SkCanvas,
  type SkPicture,
  type SkPoint,
} from '@shopify/react-native-skia';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  type LayoutChangeEvent,
  type TextStyle,
} from 'react-native';
import {
  useSharedValue as useWorkletSharedValue,
  Worklets,
} from 'react-native-worklets-core';
import { useB8SafeService } from '../index';
import { useSharedValue } from 'react-native-reanimated';
import {
  useCameraPermission,
  Camera,
  useCameraDevice,
  useFrameProcessor,
  runAtTargetFps,
  VisionCameraProxy,
  type DeviceFilter,
} from 'react-native-vision-camera';
import PopIcon from '../images/icons/PopIcon';
import type RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters';
import type { FinishCallData } from './types';
import ConnectionIcon from '../images/icons/ConnectionIcon';
import styles from './styles';

export interface RequestStillPhoto {
  requestId: string;
  resolutionMultiplier: number;
}

export type CameraScreenProps = {
  hash: string;
  title?: string;
  goBack?: () => void;
  hashChecker: string;
  titleStyle?: TextStyle;
  children?: React.ReactNode;
  messageTextStyle?: TextStyle;
  showConnectionStatus?: boolean;
  onError?: (data: FinishCallData) => void;
  onSuccess?: (data: FinishCallData) => void;
  onMessage?: (data: { message: string }) => void;
};

const plugin = VisionCameraProxy.initFrameProcessorPlugin('b8SafeProcessor');
const { width, height } = Dimensions.get('screen');

const CameraScreen: React.FC<CameraScreenProps> = ({
  hash,
  title,
  goBack,
  onError,
  children,
  onMessage,
  onSuccess,
  titleStyle = { fontSize: 15, color: '#FFF' },
  showConnectionStatus = true,
  messageTextStyle = { textAlign: 'center', fontSize: 19, color: '#FFF' },
}) => {
  if (!hash) throw new Error('hash is required');

  const {
    pc,
    start,
    connected,
    stopWebRTC,
    datachannel,
    addDataChannelFunction,
    removeDataChannelFunction,
    changeStreamResolution,
  } = useB8SafeService();

  let isMultiCamera = false;
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const layout = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const picture = useSharedValue<SkPicture>(createPicture(() => {}));

  const [message, setMessage] = useState<string>(``);

  const renderHud = (canvas: SkCanvas) => {
    const _width = layout.current?.width ?? 0;
    const _height = layout.current?.height ?? 0;

    const paint = Skia.Paint();
    const color = Skia.Color(new Float32Array([0, 0, 0, 0.8]));
    paint.setColor(color);
    canvas.drawRect({ x: 0, y: 0, width: _width, height: _height }, paint);

    const transparentPaint = Skia.Paint();
    transparentPaint.setColor(Skia.Color(new Float32Array([0, 0, 0, 0.8])));
    transparentPaint.setBlendMode(BlendMode.Clear);

    const marginLeft = _width * 0.1;
    const marginTop = _height * 0.22;
    const w = _width * 0.8;
    const h = w * 1.3082;

    const _1: SkPoint = { x: 30, y: 30 };
    const _2: SkPoint = { x: 30, y: 30 };
    const _3: SkPoint = { x: 30, y: 30 };
    const _4: SkPoint = { x: 30, y: 30 };
    canvas.drawRRect(
      {
        topLeft: _1,
        topRight: _2,
        bottomRight: _3,
        bottomLeft: _4,
        rect: { x: marginLeft, y: marginTop, width: w, height: h },
      },
      transparentPaint
    );
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    if (children) return;
    layout.current = event.nativeEvent.layout;
    picture.value = createPicture(renderHud);
  };

  const checkPermission = async () => {
    if (!hasPermission) requestPermission();
    setTimeout(() => {
      //   setCameraReady(width);
    }, 500);
  };

  const finishCall = async (data: FinishCallData) => {
    pc?.current?.getSenders().forEach((sender) => {
      sender.replaceTrack(null);
    });

    if (data?.success) {
      onSuccess && onSuccess(data);
    } else {
      stopWebRTC();
      onError && onError(data);
    }
  };

  const requestStillPhoto = (data: RequestStillPhoto) => {
    currentRequestPhoto.value = data.requestId;
    // console.log('requestStillPhoto', data);
    if (data?.resolutionMultiplier) {
      // console.log('requestStillPhoto setting received resolutionMultiplier as '+data.resolutionMultiplier);
      resolutionMultiplier.value = Number(data.resolutionMultiplier);
    } else {
      // console.log('requestStillPhoto setting default resolutionMultiplier as 0.1');
      resolutionMultiplier.value = 0.1;
    }
  };

  const upgradeResolution = (data: RTCRtpEncodingParameters) => {
    // console.log('upgradeResolution', data);
    changeStreamResolution(data);
  };

  useEffect(() => {
    if (hash) start(hash, 'back');
    addDataChannelFunction('onMessage', _onMessage);
    addDataChannelFunction('finishCall', finishCall);
    addDataChannelFunction('requestStillPhoto', requestStillPhoto);
    addDataChannelFunction('upgradeResolution', upgradeResolution);
    checkPermission();

    return () => {
      removeDataChannelFunction('onMessage');
      removeDataChannelFunction('finishCall');
      removeDataChannelFunction('requestStillPhoto');
      removeDataChannelFunction('upgradeResolution');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breakString = (str: string, size?: number) => {
    size = size ?? 60000;
    let breakStr = [];

    while (str.length > 0) {
      breakStr.push(str.substring(0, size));
      str = str.substring(size, str.length);
    }

    return breakStr;
  };

  const _onMessage = (data: { message: string }) => {
    if (!children) setMessage(data.message);
    if (onMessage) onMessage(data);
  };

  const videoHeight = (width * 16) / 9;
  const verticalSpace = (height - videoHeight) / 2;

  let device_options: DeviceFilter = {};
  const cameraDevices = Camera.getAvailableCameraDevices();
  if (cameraDevices && cameraDevices.length > 0) {
    const firstCameraDevice = cameraDevices[0]; // Você pode escolher qualquer câmera da lista, porem o ideal é a da posição [0] pois ela é a camera principal do dispositivo

    if (firstCameraDevice?.isMultiCam) {
      isMultiCamera = true;
      device_options = {
        physicalDevices: [
          'ultra-wide-angle-camera',
          'wide-angle-camera',
          'telephoto-camera',
        ],
      };
    }
  } else {
    console.log('Nenhuma câmera disponível.');
  }

  const device = useCameraDevice('back', device_options);
  const resolutionMultiplier = useWorkletSharedValue(0.1); //Usar 0.1 como default
  const currentRequestPhoto = useWorkletSharedValue<string | false>(false);
  const lastFrameSent = useWorkletSharedValue<string | false>(false);

  const sendImageToServer = Worklets.createRunOnJS((base64Img: string) => {
    if (currentRequestPhoto.value === lastFrameSent.value) return;
    // console.log('sendImageToServer:', base64Img.slice(0, 32), datachannel?.current?.readyState);

    if (datachannel?.current?.readyState === 'open') {
      lastFrameSent.value = currentRequestPhoto.value;
      // const b64Len = base64Img.length;
      const parts = breakString(base64Img);
      const frameId = currentRequestPhoto.value;
      parts?.forEach((item, index) => {
        const str = `${frameId}|${index}|${item}`;
        // if(index == 0) console.log(`${frameId}|${index}|${item}`);
        //console.log(str.substring(0, 30));
        datachannel?.current?.send(str);
      });
      const str = `${frameId}|-1|${parts.length}`;
      // console.log(str);
      datachannel?.current?.send(str);
    }
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      runAtTargetFps(4, () => {
        'worklet';
        if (
          !currentRequestPhoto.value ||
          currentRequestPhoto.value === lastFrameSent.value
        ) {
          //Previne processamento se não estamos solicitando frames
          // console.log('prevented frame processing - resolutionMultiplier: '+resolutionMultiplier);
          return;
        }
        // console.log('frame will be processed - resolutionMultiplier: '+resolutionMultiplier);
        const base64String = plugin?.call(frame, {
          resolutionMultiplier: resolutionMultiplier.value,
        }) as string;
        // console.log('base64String', base64String.substring(0, 64));
        sendImageToServer(base64String);
      });
    },
    [resolutionMultiplier, currentRequestPhoto, lastFrameSent]
  );

  return (
    <View style={styles.flex1}>
      {device && hasPermission ? (
        <Camera
          style={styles.cameraContainer}
          ref={cameraRef}
          frameProcessor={frameProcessor}
          zoom={isMultiCamera === true ? 2 : 0}
          isActive={true}
          orientation={'landscape-right'}
          focusable={true}
          device={device}
        />
      ) : (
        <View style={styles.absoluteFill} />
      )}
      <View style={styles.absoluteFill} onLayout={handleLayout}>
        {children ? (
          children
        ) : (
          <Canvas style={styles.cameraMask}>
            <Picture picture={picture} />
            <Rect x={0} y={0} width={width} height={verticalSpace + 70}>
              <LinearGradient
                start={vec(0, verticalSpace)}
                end={vec(0, verticalSpace + 70)}
                colors={['rgb(0,0,0)', 'rgba(0,0,0,0)']}
              />
            </Rect>
            <Rect
              x={0}
              y={verticalSpace + videoHeight - 70}
              width={width}
              height={verticalSpace + 70}
            >
              <LinearGradient
                start={vec(0, verticalSpace + videoHeight - 70)}
                end={vec(0, verticalSpace + videoHeight)}
                colors={['rgba(0,0,0,0)', 'rgb(0,0,0)']}
              />
            </Rect>
          </Canvas>
        )}
      </View>
      {children ? null : (
        <View style={styles.cameraMaskContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={titleStyle}>{title ?? ''}</Text>
            </View>
            <TouchableOpacity style={styles.padding30} onPress={goBack}>
              <PopIcon width={20} height={20} strokeWidth={16} stroke="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.flex1} />
          {message ? (
            <View style={styles.footer}>
              <Text style={messageTextStyle}>{message}</Text>
            </View>
          ) : null}
          {showConnectionStatus ? (
            <View style={styles.connectionStatusContainer}>
              <ConnectionIcon connected={connected} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default CameraScreen;
