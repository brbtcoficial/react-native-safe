import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  type TextStyle,
} from 'react-native';

import { useB8SafeService } from '../index';
import { useCameraPermission } from 'react-native-vision-camera';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { FinishCallData } from './types';
import { RTCView } from 'react-native-webrtc';
import {
  Canvas,
  LinearGradient,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import PopIcon from '../images/icons/PopIcon';
import styles from './styles';
import ConnectionIcon from '../images/icons/ConnectionIcon';

const { width, height } = Dimensions.get('window');

export type FacialScreenProps = {
  children?: React.ReactNode;
  hash: string;
  title?: string;
  titleStyle?: TextStyle;
  showConnectionStatus?: boolean;
  goBack?: () => void;
  messageTextStyle?: TextStyle;
  onMessage?: (data: { message: string }) => void;
  onSuccess?: (data: FinishCallData) => void;
  onError?: (data: FinishCallData) => void;
  onFaceDetected?: () => void;
};

const FacialSreen = (props: FacialScreenProps) => {
  const {
    hash,
    title,
    goBack,
    onError,
    children,
    onSuccess,
    titleStyle = { fontSize: 15, color: '#FFF' },
    onFaceDetected,
    messageTextStyle = { textAlign: 'center', fontSize: 19, color: '#FFF' },
    showConnectionStatus = true,
  } = props;

  if (!hash) throw new Error('hash is required');

  const [message, setMessage] = useState('');
  const lastMessage = useRef('');

  const { hasPermission, requestPermission } = useCameraPermission();
  const checkPermission = async () => {
    if (!hasPermission) requestPermission();
  };

  const {
    pc,
    start,
    connected,
    stopWebRTC,
    localStream,
    addDataChannelFunction,
    removeDataChannelFunction,
  } = useB8SafeService();

  const cornerSize = useSharedValue(50);
  const faceMaskWidth = useSharedValue(width * 0.6);
  const faceMaskRadius = useSharedValue(30);
  const marginTop = height * 0.2;
  const w = useSharedValue(width * 0.8);
  const h = useSharedValue(width * 0.8 * 1.3082);
  const r = useSharedValue(faceMaskRadius.value);
  const videoHeight = (width * 16) / 9;
  const verticalSpace = (height - videoHeight) / 2;

  const startHudAnimation = () => {
    faceMaskWidth.value = withDelay(
      500,
      withSequence(
        withTiming(width * 0.45, { duration: 500 }),
        withTiming(width * 0.55, { duration: 15000 })
      )
    );
    cornerSize.value = withDelay(
      500,
      withSequence(
        withTiming(50, { duration: 500 }),
        withTiming(90, { duration: 15000 })
      )
    );
  };

  const onMessage = (data: { message: string }) => {
    lastMessage.current = data.message;
    setMessage(data.message);
  };

  const finishCall = (data: FinishCallData) => {
    pc?.getSenders().forEach((sender) => {
      sender.replaceTrack(null);
    });

    if (data.success && onSuccess) onSuccess(data);
    else if (onError) onError(data);

    stopWebRTC();
  };

  const tilt_data = useSharedValue({
    tilt_left: false,
    tilt_right: false,
    tilt_up: false,
    tilt_down: false,
  });
  const onTiltChange = (data: {
    tilt_left: boolean;
    tilt_right: boolean;
    tilt_up: boolean;
    tilt_down: boolean;
  }) => {
    if (
      data.tilt_down &&
      data.tilt_left &&
      data.tilt_right &&
      data.tilt_up &&
      (tilt_data.value.tilt_down !== data.tilt_down ||
        tilt_data.value.tilt_left !== data.tilt_left ||
        tilt_data.value.tilt_right !== data.tilt_right ||
        tilt_data.value.tilt_up !== data.tilt_up)
    ) {
      cornerSize.value = withDelay(
        200,
        withTiming(cornerSize.value * 2, { duration: 500 })
      );
      Vibration.vibrate(200);
    }
    tilt_data.value = data;
  };

  const animateFaceDetected = () => {
    onFaceDetected && onFaceDetected();
    startHudAnimation();
  };

  useEffect(() => {
    checkPermission();
    // startHudAnimation();
    start(hash, 'front', true);
    addDataChannelFunction('onMessage', onMessage);
    addDataChannelFunction('finishCall', finishCall);
    addDataChannelFunction('onTiltChange', onTiltChange);
    addDataChannelFunction(
      'startFacialVerificationProccess',
      animateFaceDetected
    );
    return () => {
      removeDataChannelFunction('onMessage');
      removeDataChannelFunction('finishCall');
      removeDataChannelFunction('onTiltChange');
      removeDataChannelFunction('startFacialVerificationProccess');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messageTopPosition = useDerivedValue(() => {
    const messageTopSpacing = 40;
    return marginTop + h.value + messageTopSpacing;
  }, []);

  const messageTopStyle = useAnimatedStyle(
    () => ({
      alignItems: 'center',
      paddingHorizontal: width * 0.08,
      position: 'absolute',
      top: messageTopPosition.value,
    }),
    []
  );

  return (
    <View style={styles.flex1}>
      {localStream && hasPermission ? (
        <RTCView
          style={styles.cameraContainer}
          objectFit="cover"
          streamURL={localStream.toURL()}
          mirror={true}
        />
      ) : (
        <View style={styles.absoluteFill} />
      )}
      <View style={styles.absoluteFill}>
        {children ? (
          children
        ) : (
          <Canvas style={styles.cameraMask}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              color={'rgba(0, 0, 0, .8)'}
            />
            <RoundedRect
              x={width * 0.1}
              y={marginTop}
              width={w}
              height={h}
              r={r}
              blendMode="clear"
            />
            <RoundedRect
              x={width * 0.1}
              y={marginTop}
              width={w}
              height={h}
              r={faceMaskRadius}
              blendMode="src"
              style={'stroke'}
            />

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
              <PopIcon
                width={20}
                height={20}
                strokeWidth={16}
                stroke={titleStyle?.color ?? '#FFF'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.flex1} />

          {message ? (
            <Animated.View style={messageTopStyle}>
              <Text style={messageTextStyle}>{message}</Text>
            </Animated.View>
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

export default FacialSreen;
