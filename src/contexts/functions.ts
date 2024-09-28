import type { RTCSessionDescription } from 'react-native-webrtc';
import {
  mediaDevices,
  RTCPeerConnection,
  type MediaStream,
} from 'react-native-webrtc';
import type RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import type RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters';

export interface RTCConnectionInterface {
  pc: RTCPeerConnection;
  connected: boolean;
  datachannel: RTCDataChannel;
  stopWebRTC: () => void;
  localStream?: MediaStream;
}

export type DeviceList = {
  deviceId: string;
  facing: 'environment' | 'front';
  groupId: string;
  kind: 'videoinput';
  label: string;
}[];

interface RTCConnectionInterfaceOptions {
  hashChecker: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onConnectionStart?: (stream: MediaStream) => void;
  onConnectionStop?: () => void;
}

export class RTCConnectionInterface {
  hashChecker: string;
  functions: { [key: string]: (data: any) => void };
  options: RTCConnectionInterfaceOptions;

  constructor(options: RTCConnectionInterfaceOptions) {
    this.hashChecker = options.hashChecker;
    this.options = options;
    this.connected = false;
    this.functions = {};

    this.pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:54.94.8.152:3478',
          username: 'yJr4LWEp82m6gVCh',
          credential: 'xrp73KVqagYMG2te',
        },
      ],
    });

    this.pc.addEventListener('iceconnectionstatechange', () => {
      switch (this.pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          this.connected = true;
          if (options.onConnected) options.onConnected();

          break;
        default:
          if (options.onDisconnected) options.onDisconnected();
          this.connected = false;
      }
    });
  }

  addDataChannelFunction(key: string, func: (value: any) => void) {
    this.functions[key] = func;
  }

  removeDataChannelFunction(key: string) {
    if (this.functions[key]) delete this.functions[key];
  }

  handleChannelData(data: any) {
    if (data.function) {
      const func = this.functions[data.function];
      if (typeof func === 'function') func(data.data);
    }
  }

  sdpFilterCodec(kind: 'audio' | 'video', codec: string, realSdp: string) {
    var allowed = [];
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\\r$');
    var codecRegex = new RegExp(
      'a=rtpmap:([0-9]+) ' + codec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
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
  }

  negotiate(hash: string, videoEnabled = false) {
    this.pc
      .createOffer({
        OfferToReceiveVideo: true,
        OfferToReceiveAudio: false,
      })
      .then((offer: RTCSessionDescription) => {
        offer._sdp = offer.sdp?.replace(
          'a=max-message-size:262144',
          'a=max-message-size:65536'
        );
        this.pc.setLocalDescription(offer);
      })
      .then(() => {
        return new Promise((resolve) => {
          if (this.pc.iceGatheringState === 'complete') resolve(true);
          else {
            const checkState = () => {
              if (this.pc.iceGatheringState === 'complete') {
                this.pc.removeEventListener(
                  'icegatheringstatechange',
                  checkState
                );
                resolve(true);
              }
            };
            this.pc.addEventListener('icegatheringstatechange', checkState);
          }
        });
      })
      .then(() => {
        const offer = this.pc.localDescription;
        if (offer) {
          offer._sdp = this.sdpFilterCodec('video', 'VP8/90000', offer._sdp);
          fetch(`https://kyc.b8.com.br/${this.hashChecker}/${hash}`, {
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
  }

  async changeStreamResolution(
    _params: RTCRtpEncodingParameters & {
      degradationPreference?:
        | 'maintain-resolution'
        | 'balanced'
        | 'disabled'
        | 'maintain-framerate';
    }
  ) {
    const maxBitrateInBitsPerSecond = 75000;
    const senders = this.pc.getSenders();
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
  }

  start(hash: string, type: 'front' | 'back', videoEnabled = true) {
    this.datachannel = this.pc.createDataChannel('b8safe', {
      ordered: true,
      maxRetransmits: 30,
    });

    this.datachannel.addEventListener('open', () =>
      console.log('Datachannel oppened')
    );
    this.datachannel.addEventListener('close', () =>
      console.log('Datachannel closed')
    );
    this.datachannel.addEventListener('message', (message) => {
      this.handleChannelData(JSON.parse(message.data.toString()));
    });

    if (videoEnabled) {
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
              this.pc.addTrack(track, stream);
            });

            this.options.onConnectionStart &&
              this.options.onConnectionStart(stream);

            if (type === 'back') {
              this.changeStreamResolution({
                maxFramerate: 30,
                scaleResolutionDownBy: 2,
                maxBitrate: 3000,
              } as any);
            }

            return this.negotiate(hash, videoEnabled);
          })
          .catch((e) => console.log(e));
      });
    } else this.negotiate(hash, false);
  }

  stop() {
    this.pc.close();
    if (this.options.onConnectionStop) this.options.onConnectionStop();
  }
}
