import { Address } from "viem";
import { underlying } from "../../chainDeploy/helpers/utils";
import { assetSymbols } from "../assets";
import { ChainAddresses } from "../types";
import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  UNISWAP_V2_FACTORY: "" as Address,
  UNISWAP_V2_ROUTER: "" as Address,
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V3: {
    FACTORY: "0x8c7d3063579BdB0b90997e18A770eaE32E1eBb08",
    QUOTER_V2: "0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF"
  },
  UNISWAP_V3_ROUTER: "0x3EF68D3f7664b2805D4E88381b64868a56f88bC4",
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x97CB85Eb5F892Dd02866672EAB137b3C34501b7b"
};

export default chainAddresses;
