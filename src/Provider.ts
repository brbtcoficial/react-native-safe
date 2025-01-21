import { useContext } from "react";
import type { RTCConnectionInterface } from "./functions/RTCConnectionInterface";

import {
    B8SafeProvider as Provider,
    B8SafeServiceContext,
} from "./contexts/B8Safe";

export const B8SafeProvider = Provider;
export const useB8SafeService = (): RTCConnectionInterface | null => {
    return useContext(B8SafeServiceContext);
};
