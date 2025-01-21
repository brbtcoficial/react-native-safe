import { withLocationEnabled } from "./withLocationEnabled";
import { withPermissions } from "./withPermissions";
import { withAuthentication } from "./withAuthentication";
import type { ConfigPlugin } from "@expo/config-plugins";
import { createRunOncePlugin, withPlugins } from "@expo/config-plugins";
import { ConfigProps } from "./@types";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const pkg = require("../../../package.json");

const withB8Safe: ConfigPlugin<ConfigProps> = (config, props = {}) => {
    const { enableLocation = false, hashChecker = "" } = props;

    if (enableLocation) config = withLocationEnabled(config, props);

    if (hashChecker !== "") config = withAuthentication(config, hashChecker);

    config = withPlugins(config, [[withPermissions, props]]);

    return config;
};

export default createRunOncePlugin(withB8Safe, pkg.name, pkg.version);
