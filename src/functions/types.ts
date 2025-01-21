import { MediaStream } from "react-native-webrtc";

export type SocketData = {
    function: string;
    [key: string]: unknown;
};

export interface RTCConnectionInterfaceOptions {
    hashChecker: string;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onConnectionStart?: (stream: MediaStream) => void;
    onConnectionStop?: () => void;
}

export type DeviceList = {
    deviceId: string;
    facing: "environment" | "front";
    groupId: string;
    kind: "videoinput";
    label: string;
}[];
