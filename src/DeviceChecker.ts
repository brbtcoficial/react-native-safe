import { getToken } from "./DeviceCheck/module";
import { TokenType } from "./DeviceCheck/types";
import CameraScreen from "./screens/Camera";

// Device integrity token
export function getIntegrityToken(
    payload?: object,
    type?: TokenType,
): Promise<string | null> {
    return getToken(payload, type);
}

export const Camera = CameraScreen;
