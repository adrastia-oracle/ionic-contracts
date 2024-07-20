import { underlying } from "../../chainDeploy/helpers/utils";
import { RedemptionStrategy, RedemptionStrategyContract } from "../types";
import { assets } from "./assets";

const redemptionStrategies: RedemptionStrategy[] = [
  {
    inputToken: underlying(assets, "USDC"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "USDC")
  },
  {
    inputToken: underlying(assets, "USDT"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "USDC")
  },
  {
    inputToken: underlying(assets, "USDC"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "USDT")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "USDT")
  },
  {
    inputToken: underlying(assets, "USDT"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WBTC")
  },
  {
    inputToken: underlying(assets, "WBTC"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "ezETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "ezETH")
  },
  {
    inputToken: underlying(assets, "weETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "weETH")
  },
  {
    inputToken: underlying(assets, "wrsETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "wrsETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "mBTC")
  },
  {
    inputToken: underlying(assets, "mBTC"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "MODE")
  },
  {
    inputToken: underlying(assets, "MODE"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  // {
  //   inputToken: underlying(assets, "WETH"),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, "ION")
  // },
  // {
  //   inputToken: underlying(assets, "ION"),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, "WETH")
  // },
  {
    inputToken: underlying(assets, "mBTC"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "WETH")
  },
  {
    inputToken: underlying(assets, "WETH"),
    strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
    outputToken: underlying(assets, "mBTC")
  }
  // ,{
  //   inputToken: underlying(assets, "WETH"),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, "KIM")
  // },
  // {
  //   inputToken: underlying(assets, "KIM"),
  //   strategy: RedemptionStrategyContract.AlgebraSwapLiquidator,
  //   outputToken: underlying(assets, "WETH")
  // }
];

export default redemptionStrategies;
