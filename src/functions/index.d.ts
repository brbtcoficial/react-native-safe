type SocketData = {
  function: string;
  [key: string]: unknown;
};

interface RTCConnectionInterfaceOptions {
  hashChecker: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onConnectionStart?: (stream: MediaStream) => void;
  onConnectionStop?: () => void;
}

type DeviceList = {
  deviceId: string;
  facing: 'environment' | 'front';
  groupId: string;
  kind: 'videoinput';
  label: string;
}[];
