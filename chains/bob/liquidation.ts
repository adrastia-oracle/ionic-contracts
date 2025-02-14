import { parseEther, zeroAddress } from "viem";

import chainAddresses from "./addresses";
import { USDC, WETH } from "./assets";
import { LiquidationDefaults, LiquidationStrategy } from "../types";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [zeroAddress, WETH, USDC],
  SUPPORTED_INPUT_CURRENCIES: [zeroAddress, WETH],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: parseEther("0.001"),
  LIQUIDATION_INTERVAL_SECONDS: 20
};

export default liquidationDefaults;
