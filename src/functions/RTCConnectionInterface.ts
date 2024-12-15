import type { RTCSessionDescription } from 'react-native-webrtc';
import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';
import type RTCDataChannel from 'react-native-webrtc/lib/typescript/RTCDataChannel';
import type RTCRtpEncodingParameters from 'react-native-webrtc/lib/typescript/RTCRtpEncodingParameters';

export class RTCConnectionInterface {
  pc: RTCPeerConnection | null;
  connected: boolean;
  hashChecker: string;
  datachannel: RTCDataChannel | null;
  functions: { [key: string]: (data: unknown) => void };
  options: RTCConnectionInterfaceOptions;

  constructor(options: RTCConnectionInterfaceOptions) {
    this.pc = null;
    this.hashChecker = options.hashChecker;
    this.options = options;
    this.connected = false;
    this.functions = {};
    this.datachannel = null;
  }

  initRTC(): void {
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
      if (this.pc == null) return;
      switch (this.pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          this.connected = true;
          if (this.options.onConnected != null) this.options.onConnected();

          break;
        default:
          if (this.options.onDisconnected != null)
            this.options.onDisconnected();
          this.connected = false;
      }
    });

    this.datachannel = this.pc.createDataChannel('b8safe', {
      ordered: true,
      maxRetransmits: 30,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addDataChannelFunction(key: string, func: (value: any) => void): void {
    this.functions[key] = func;
  }

  removeDataChannelFunction(key: string): void {
    if (this.functions[key] != null) delete this.functions[key];
  }

  handleChannelData(data: SocketData): void {
    if (typeof data === 'object' && 'function' in data) {
      const func = this.functions[(data as { function: string }).function];
      if (typeof func === 'function') func(data.data ?? null);
    }
  }

  sdpFilterCodec(
    kind: 'audio' | 'video',
    codec: string,
    realSdp: string
  ): string {
    const allowed = [];
    const rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\\r$');
    const codecRegex = new RegExp(
      'a=rtpmap:([0-9]+) ' + codec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$');

    const lines = realSdp.split('\n');

    let isKind = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('m=' + kind + ' ')) isKind = true;
      else if (lines[i]?.startsWith('m=')) isKind = false;

      if (isKind) {
        let match = lines[i]?.match(codecRegex);
        if (match == null) continue;
        if (match[1] != null) allowed.push(parseInt(match[1], 10));

        match = lines[i]?.match(rtxRegex);
        if (match == null) continue;
        if (
          match[1] != null &&
          match[2] != null &&
          allowed.includes(parseInt(match[2], 10))
        )
          allowed.push(parseInt(match[1], 10));
      }
    }

    const skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    let sdp = '';

    isKind = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.startsWith('m=' + kind + ' ')) isKind = true;
      else if (lines[i]?.startsWith('m=')) isKind = false;

      if (isKind) {
        const skipMatch = lines[i]?.match(skipRegex);
        if (
          skipMatch != null &&
          skipMatch[2] != null &&
          !allowed.includes(parseInt(skipMatch[2], 10))
        ) {
          continue;
        } else if (lines[i]?.match(videoRegex) != null) {
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

  negotiate(hash: string, videoEnabled = false): void {
    if (this.pc == null)
      throw new Error('PeerConnection not initialized on negotiate');
    this.pc
      .createOffer({
        OfferToReceiveVideo: true,
        OfferToReceiveAudio: false,
      })
      .then((offer: RTCSessionDescription) => {
        offer._sdp = offer.sdp.replace(
          'a=max-message-size:262144',
          'a=max-message-size:65536'
        );
        if (this.pc == null)
          throw new Error('PeerConnection not initialized on negotiate');
        this.pc.setLocalDescription(offer);
      })
      .then(() => {
        return new Promise((resolve) => {
          if (this.pc == null)
            throw new Error('PeerConnection not initialized on negotiate');
          if (this.pc.iceGatheringState === 'complete') {
            resolve(true);
          } else {
            const checkState = (): void => {
              if (this.pc == null) {
                throw new Error(
                  'PeerConnection not initialized on negotiate > checkState'
                );
              }
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
        if (this.pc == null)
          throw new Error('PeerConnection not initialized on negotiate');
        const offer = this.pc.localDescription;
        if (offer != null) {
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
            console.info('Teste de resultado: ', res);
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

  changeStreamResolution(
    _params: RTCRtpEncodingParameters & {
      degradationPreference?:
        | 'maintain-resolution'
        | 'balanced'
        | 'disabled'
        | 'maintain-framerate';
    }
  ): void {
    if (this.pc == null) throw new Error('PeerConnection not initialized');
    const maxBitrateInBitsPerSecond = 75000;
    const senders = this.pc.getSenders();
    senders.forEach((sender) => {
      if (sender.track?.kind === 'video') {
        const params = sender.getParameters();
        if (params.encodings[0] != null)
          params.encodings[0].maxBitrate = maxBitrateInBitsPerSecond;
        sender
          .setParameters(params)
          .then(() => console.info('parameter defined'))
          .catch((e) => console.error('error:', e));
      }
    });
  }

  start(hash: string, type: 'front' | 'back', videoEnabled = true): void {
    if (this.pc == null) this.initRTC();
    if (this.datachannel == null)
      throw new Error('Datachannel not initialized');
    this.datachannel.addEventListener('open', () =>
      console.info('Datachannel oppened')
    );
    this.datachannel.addEventListener('close', () =>
      console.info('Datachannel closed')
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
          if (device.facing === (type === 'front' ? 'front' : 'environment'))
            deviceId = device.deviceId;
          // devices.push({ sourceId: device.deviceId });
        });

        constraints.video.deviceId = deviceId;

        mediaDevices
          .getUserMedia(constraints)
          .then((stream) => {
            stream.getTracks().forEach((track) => {
              if (this.pc == null)
                throw new Error('PeerConnection not initialized');
              this.pc.addTrack(track, stream);
            });

            this.options.onConnectionStart != null &&
              this.options.onConnectionStart(stream);

            if (type === 'back') {
              this.changeStreamResolution({
                maxFramerate: 30,
                scaleResolutionDownBy: 2,
                maxBitrate: 3000,
              } as RTCRtpEncodingParameters);
            }

            return this.negotiate(hash, videoEnabled);
          })
          .catch((e) => console.error(e));
      });
    } else {
      this.negotiate(hash, false);
    }
  }

  stop(): void {
    if (this.pc == null) throw new Error('PeerConnection not initialized');
    this.pc.close();
    if (this.options.onConnectionStop != null) this.options.onConnectionStop();
  }
}
