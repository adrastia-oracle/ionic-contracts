import { default as mode } from "./mode";
import { ChainConfig } from "./types";

export { mode };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode
};
