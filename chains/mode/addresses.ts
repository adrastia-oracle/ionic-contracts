import { zeroAddress } from "viem";

import { assets } from "./assets";
import { ChainAddresses } from "../types";
import { underlying } from "../../chainDeploy/helpers/utils";

const chainAddresses: ChainAddresses = {
  STABLE_TOKEN: underlying(assets, "USDC"),
  UNISWAP_V2_ROUTER: "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
  UNISWAP_V2_FACTORY: "0xc02155946dd8c89d3d3238a6c8a64d04e2cd4500",
  UNISWAP_V3: {
    FACTORY: "0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5" // kim v4
  },
  UNISWAP_V3_ROUTER: "0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8", // kim v4
  W_BTC_TOKEN: underlying(assets, "WBTC"),
  W_TOKEN: underlying(assets, "WETH"),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: zeroAddress,
  EXPRESS_RELAY: "0x5Cc070844E98F4ceC5f2fBE1592fB1ed73aB7b48"
};

export default chainAddresses;
