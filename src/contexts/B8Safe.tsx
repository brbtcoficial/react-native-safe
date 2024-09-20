import React, {
  createContext,
  useRef,
  useState,
  type MutableRefObject,
  useEffect,
} from 'react';
import { NativeModules } from 'react-native';
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters';

export interface FacialRecognitionChannelData {
  function: string;
  data: any;
}

export interface Context {
  pc: MutableRefObject<RTCPeerConnection | undefined> | null;
  start: (hash: string, type: 'front' | 'back', videoEnabled?: boolean) => void;
  connected: boolean;
  datachannel: MutableRefObject<RTCDataChannel | undefined> | null;
  stopWebRTC: () => void;
  localStream?: MediaStream;
  changeStreamResolution: (params: RTCRtpEncodingParameters) => Promise<void>;
  addDataChannelFunction: (key: string, value: (value: any) => void) => void;
  removeDataChannelFunction: (key: string) => void;
}

export type DeviceList = {
  deviceId: string;
  facing: 'environment' | 'front';
  groupId: string;
  kind: 'videoinput';
  label: string;
}[];

export interface Configuration {
  children: React.ReactNode;
  hashChecker: string;
}

/**
 * Prepare Standard Integrity Token Provider
 * @method prepareStandardIntegrityTokenProvider
 * @param  {Number} cloudProjectNumber Cloud project number (optional)
 * @return {Promise}
 */
async function prepareSITProvider(cloudProjectNumber?: string): Promise<void> {
  return await NativeModules.PlayIntegrity.prepareStandardIntegrityTokenProvider(
    cloudProjectNumber
  );
}

const DEFAULT_VALUE: Context = {
  pc: null,
  connected: false,
  start: () => {},
  datachannel: null,
  stopWebRTC: () => {},
  localStream: undefined,
  changeStreamResolution: async () => {},
  addDataChannelFunction: () => {},
  removeDataChannelFunction: () => {},
};

export const B8SafeServiceContext = createContext<Context>(DEFAULT_VALUE);

export const B8SafeProvider: React.FC<Configuration> = ({
  children,
  hashChecker,
}) => {
  const [connected, setConnected] = useState(false);
  const [localStream, setlocalStream] = useState<MediaStream>();

  const pc = useRef<RTCPeerConnection>();
  const datachannel = useRef<RTCDataChannel>();

  const stopWebRTC = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      pc.current?.close();
      pc.current = undefined;
      localStream.release();
      setlocalStream(undefined);
    }
  };

  const functions = useRef<{ [key: string]: (data: any) => void }>({});

  const handleChannelData = (data: FacialRecognitionChannelData) => {
    if (data.function) {
      const func = functions.current[data.function];
      if (typeof func === 'function') func(data.data);
    }
  };

  const prepareStandardIntegrityTokenProvider = async () => {
    try {
      await prepareSITProvider();
    } catch (e) {
      console.error('Erro ao preparar o provider de integridade padrão:', e);
    }
  };

  const changeStreamResolution = async (
    _params: RTCRtpEncodingParameters & {
      degradationPreference?:
        | 'maintain-resolution'
        | 'balanced'
        | 'disabled'
        | 'maintain-framerate';
    }
  ) => {
    const maxBitrateInBitsPerSecond = 75000;
    const senders = pc.current?.getSenders();
    senders?.forEach((sender) => {
      if (sender.track?.kind === 'video') {
        const params = sender.getParameters();
        if (params.encodings[0])
          params.encodings[0].maxBitrate = maxBitrateInBitsPerSecond;
        sender
          .setParameters(params)
          .then(() => console.log('parameter defined'))
          .catch((e) => console.log('error:', e));
      }
    });
  };

  const createPeerConnection = () => {
    const _pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:54.94.8.152:3478',
          username: 'yJr4LWEp82m6gVCh',
          credential: 'xrp73KVqagYMG2te',
        },
      ],
    });

    let iceConnectionLog = { textContent: '' };
    _pc.addEventListener(
      'iceconnectionstatechange',
      () => {
        switch (pc.current?.iceConnectionState) {
          case 'connected':
          case 'completed':
            // You can handle the call being connected here.
            // Like setting the video streams to visible.
            setConnected(true);

            break;
          default:
            setConnected(false);
        }
      },
      false
    );
    iceConnectionLog.textContent = _pc.iceConnectionState;

    let signalingLog = { textContent: '' };
    _pc.addEventListener(
      'signalingstatechange',
      () => {
        signalingLog.textContent += ' -> ' + (pc.current?.signalingState ?? '');
      },
      false
    );
    signalingLog.textContent = _pc.signalingState;

    return _pc;
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  const sdpFilterCodec = (
    kind: 'audio' | 'video',
    codec: string,
    realSdp: string
  ) => {
    var allowed = [];
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec));
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$');

    var lines = realSdp.split('\n');

    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('m=' + kind + ' ')) {
        isKind = true;
      } else if (lines[i]?.startsWith('m=')) {
        isKind = false;
      }

      if (isKind) {
        var match = lines[i]?.match(codecRegex);
        if (match && match[1]) {
          allowed.push(parseInt(match[1], 10));
        }

        match = lines[i]?.match(rtxRegex);
        if (
          match &&
          match[1] &&
          match[2] &&
          allowed.includes(parseInt(match[2], 10))
        ) {
          allowed.push(parseInt(match[1], 10));
        }
      }
    }

    var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    var sdp = '';

    isKind = false;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('m=' + kind + ' ')) {
        isKind = true;
      } else if (lines[i]?.startsWith('m=')) {
        isKind = false;
      }

      if (isKind) {
        var skipMatch = lines[i]?.match(skipRegex);
        if (
          skipMatch &&
          skipMatch[2] &&
          !allowed.includes(parseInt(skipMatch[2], 10))
        ) {
          continue;
        } else if (lines[i]?.match(videoRegex)) {
          sdp +=
            lines[i]?.replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n';
        } else {
          sdp += lines[i] + '\n';
        }
      } else {
        sdp += lines[i] + '\n';
      }
    }

    return sdp;
  };

  const negotiate = (hash: string, videoEnabled = false) => {
    // console.log('negotiation hash', hash);
    pc.current
      ?.createOffer({
        OfferToReceiveVideo: true,
        OfferToReceiveAudio: false,
      })
      .then((offer: RTCSessionDescription) => {
        offer._sdp = offer.sdp?.replace(
          'a=max-message-size:262144',
          'a=max-message-size:65536'
        );
        pc.current?.setLocalDescription(offer);
      })
      .then(() => {
        return new Promise((resolve) => {
          if (pc.current?.iceGatheringState === 'complete') resolve(true);
          else {
            function checkState() {
              if (pc.current?.iceGatheringState === 'complete') {
                pc.current?.removeEventListener(
                  'icegatheringstatechange',
                  checkState
                );
                resolve(true);
              }
            }
            pc.current?.addEventListener('icegatheringstatechange', checkState);
          }
        });
      })
      .then(() => {
        const offer = pc.current?.localDescription;
        if (offer) {
          offer._sdp = sdpFilterCodec('video', 'VP8/90000', offer._sdp);

          fetch(`https://kyc.b8.com.br/${hashChecker}/${hash}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              streamingType: videoEnabled ? 'video' : 'image',
              rtcMessage: offer,
            }),
          }).then((res) => {
            console.log('Teste de resultado: ', res);
            // if (res && res.success && res.rtcMessage.type === 'answer') {
            //     pc.current?.setRemoteDescription(new RTCSessionDescription(res.rtcMessage))
            //         .then(() => console.log('pc.current?.signalingState', pc.current?.signalingState))
            //         .catch(e => console.log(e, pc.current?.connectionState, pc.current?.signalingState, pc.current?.iceConnectionState));
            // }
            // else if (res?.message) showMessage(res.message);
          });
        }
      });
  };

  const start = (
    hash: string,
    type: 'front' | 'back',
    videoEnabled = false
  ) => {
    pc.current = createPeerConnection();
    datachannel.current = pc.current.createDataChannel('chat', {
      ordered: true,
      maxRetransmits: 30,
    });
    datachannel.current.addEventListener('open', () =>
      console.log('data channel open')
    );
    datachannel.current.addEventListener('close', () =>
      console.log('data channel close')
    );
    datachannel.current.addEventListener('message', (message: any) => {
      // console.log('data channel message', message);
      handleChannelData(JSON.parse(message.data.toString()));
    });

    const constraints = {
      audio: false,
      video: {
        minWidth: 960,
        minHeight: 540,
        width: 1280,
        height: 720,
        maxWidth: 3840,
        maxHeight: 2160,
        frameRate: 24,
        facingMode: type === 'front' ? 'user' : 'environment',
        deviceId: '',
      },
    };

    if (videoEnabled) {
      mediaDevices.enumerateDevices().then((deviceList) => {
        const dList = deviceList as DeviceList;
        let deviceId = '';
        dList.forEach((device) => {
          if (device.kind === 'videoinput') {
            if (device.facing === (type === 'front' ? 'front' : 'environment'))
              deviceId = device.deviceId;
            // devices.push({ sourceId: device.deviceId });
          }
        });

        constraints.video.deviceId = deviceId;

        mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
            stream.getTracks().forEach((track) => {
              pc.current?.addTrack(track, stream);
            });
            setlocalStream(stream);

            if (type === 'back') {
              changeStreamResolution({
                maxFramerate: 30,
                scaleResolutionDownBy: 2,
                maxBitrate: 3000,
              } as any);
            }

            return negotiate(hash, videoEnabled);
          })
          .catch((e) => console.log(e));
      });
    } else negotiate(hash);
  };

  const addDataChannelFunction = (
    index: string,
    func: (value: any) => void
  ) => {
    functions.current[index] = func;
  };

  const removeDataChannelFunction = (index: string) => {
    if (functions.current[index]) delete functions.current[index];
  };

  useEffect(() => {
    prepareStandardIntegrityTokenProvider();
  }, []);

  return (
    <B8SafeServiceContext.Provider
      value={{
        pc: pc,
        start,
        connected,
        stopWebRTC,
        localStream,
        datachannel,
        changeStreamResolution,
        addDataChannelFunction,
        removeDataChannelFunction,
      }}
    >
      {children}
    </B8SafeServiceContext.Provider>
  );
};
