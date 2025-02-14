import { parseEther, parseUnits } from "viem";

import { ChainlinkFeedBaseCurrency, ChainlinkSpecificParams, OracleTypes, SupportedAsset } from "../types";
import { assetSymbols } from "../assets";

export const WETH = "0x4200000000000000000000000000000000000006";
export const WBTC = "0x03c7054bcb39f7b2e5b2c7acb37583e32d70cfa3";
export const tBTC = "0xBBa2eF945D523C4e2608C9E1214C2Cc64D4fc2e2";
export const USDT = "0x05d032ac25d322df992303dca074ee7392c117b9";
export const SOV = "0xba20a5e63eeEFfFA6fD365E7e540628F8fC61474";
export const USDC = "0xe75D0fB2C24A55cA1e3F96781a2bCC7bdba058F0";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    initialSupplyCap: parseEther(String(3_000)).toString(),
    initialBorrowCap: parseEther("0.01").toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x1Ff2fFada49646fB9b326EdF8A91446d3cf9a291",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseUnits(String(100), 8).toString(),
    initialBorrowCap: parseUnits("0.00001", 8).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x7D126c43B4A6e3EF39B310bbcC2c4D71C77AD627",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseUnits(String(10_000_000), 6).toString(),
    initialBorrowCap: parseUnits(String(30), 6).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.tBTC,
    underlying: tBTC,
    name: "tBTC v2",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0xA2C438a949171FAAED89FE05696E2FF31A1d97B3",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseUnits(String(100), 18).toString(),
    initialBorrowCap: parseUnits("0.00001", 18).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x1030Be1aFF580687Ca161a96140D146f43Edaa65",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseUnits(String(10_000_000), 6).toString(),
    initialBorrowCap: parseUnits(String(30), 6).toString(),
    initialCf: "0.85"
  },
  {
    symbol: assetSymbols.SOV,
    underlying: SOV,
    name: "SOV",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    oracleSpecificParams: {
      aggregator: "0x77466772A46895269bff44e509096E4073d4Dc67",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    } as ChainlinkSpecificParams,
    initialSupplyCap: parseUnits(String(20_000_000), 18).toString(),
    initialBorrowCap: parseUnits(String(69), 18).toString(),
    initialCf: "0.45"
  }
];

export default assets;
