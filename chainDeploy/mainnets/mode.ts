import { Hash, zeroAddress } from "viem";

import { ChainDeployConfig, deployChainlinkOracle, deployPythPriceOracle } from "../helpers";
import { writeTransactionsToFile } from "../helpers/logging";
import { addRedstoneFallbacks } from "../helpers/oracles/redstoneFallbacks";
import { addRedstoneWeETHFallbacks } from "../helpers/oracles/redstoneWeETHFallbacks";
import { deployRedStoneWrsETHPriceOracle } from "../helpers/oracles/redstoneWrsETH";
import { ChainlinkAsset, ChainlinkFeedBaseCurrency, PythAsset, RedStoneAsset } from "../../chains/types";
import { mode } from "../../chains";
import { underlying } from "../helpers/utils";
import { assetSymbols } from "../../chains/assets";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: 30 * 60 * 24 * 365, // 30 blocks per minute = 2 sec block time
  cgId: "ethereum",
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN,
  nativeTokenUsdChainlinkFeed: "0xa47Fd122b11CdD7aad7c3e8B740FB91D83Ce43D1",
  uniswap: {
    flashSwapFee: 30, // TODO set the correct fee
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: zeroAddress,
    uniswapV2RouterAddress: "0x5D61c537393cf21893BE619E36fC94cd73C77DD3",
    uniswapV3SwapRouter: "0xC9Adff795f46105E53be9bbf14221b1C9919EE25",
    uniswapV3Quoter: "0x7Fd569b2021850fbA53887dd07736010aCBFc787"
  },
  wtoken: mode.chainAddresses.W_TOKEN
};

// TODO add more assets https://pyth.network/developers/price-feed-ids
const pythAssets: PythAsset[] = [
  {
    underlying: underlying(mode.assets, assetSymbols.USDC),
    feed: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.USDT),
    feed: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.WBTC),
    feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  },
  {
    underlying: underlying(mode.assets, assetSymbols.mBTC),
    feed: "0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33"
  }
];

const api3Assets: ChainlinkAsset[] = [
  {
    symbol: assetSymbols.ezETH,
    aggregator: "0x85baF4a3d1494576d0941a146E24a8690Efa87D5",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  },
  {
    symbol: assetSymbols.weETH,
    aggregator: "0x95a02CBb3f19D88b228858A48cFade87fd337c22",
    feedBaseCurrency: ChainlinkFeedBaseCurrency.ETH
  }
];

const redStoneWrsETHAssets: RedStoneAsset[] = [
  {
    underlying: underlying(mode.assets, assetSymbols.wrsETH)
  }
];

const convertedApi3Assets: PythAsset[] = api3Assets.map((asset) => ({
  underlying: underlying(mode.assets, asset.symbol),
  feed: asset.aggregator
}));

export const deploy = async ({
  run,
  viem,
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  await deployPythPriceOracle({
    run,
    deployConfig,
    viem,
    getNamedAccounts,
    deployments,
    usdToken: mode.chainAddresses.STABLE_TOKEN,
    pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    pythAssets,
    nativeTokenUsdFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  });

  await deployChainlinkOracle({
    run,
    viem,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: mode.assets,
    chainlinkAssets: api3Assets
  });

  await addRedstoneFallbacks({
    viem,
    getNamedAccounts,
    deployments,
    redStoneAssets: [...pythAssets, convertedApi3Assets[0]],
    redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
    run,
    deployConfig
  });

  await addRedstoneWeETHFallbacks({
    viem,
    getNamedAccounts,
    deployments,
    redStoneAssets: [convertedApi3Assets[1]],
    redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
    run,
    deployConfig
  });

  await deployRedStoneWrsETHPriceOracle({
    run,
    deployConfig,
    viem,
    getNamedAccounts,
    deployments,
    redStoneAddress: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
    redStoneAssets: redStoneWrsETHAssets
  });

  const algebraSwapLiquidator = await deployments.deploy("AlgebraSwapLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (algebraSwapLiquidator.transactionHash) {
    await publicClient.waitForTransactionReceipt({ hash: algebraSwapLiquidator.transactionHash as Hash });
  }
  console.log("AlgebraSwapLiquidator: ", algebraSwapLiquidator.address);
  await writeTransactionsToFile();
};
