import { Address } from "viem";
import { LiquidatorsRegistryConfigFnParams } from "../../../chains/types";
import { chainIdToConfig } from "../../../chains";

export const configureLiquidatorsRegistry = async ({
  viem,
  getNamedAccounts,
  chainId,
  deployments
}: LiquidatorsRegistryConfigFnParams): Promise<void> => {
  const publicClient = await viem.getPublicClient();

  const lr = await viem.getContractAt(
    "LiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address
  );
  const liquidatorsRegistry = await viem.getContractAt("ILiquidatorsRegistry", lr.address);

  {
    const strategies: string[] = [];
    const inputTokens: string[] = [];
    const outputTokens: string[] = [];

    for (const redemptionStrategy of chainIdToConfig[chainId].redemptionStrategies) {
      const { strategy, outputToken, inputToken } = redemptionStrategy;
      const redemptionStrategyContract = await viem.getContractAt(
        strategy,
        (await deployments.get(strategy)).address as Address
      );

      strategies.push(redemptionStrategyContract.address);
      inputTokens.push(inputToken);
      outputTokens.push(outputToken);
    }
    const matchingStrategies = await liquidatorsRegistry.read.pairsStrategiesMatch([
      strategies,
      inputTokens,
      outputTokens
    ]);
    if (!matchingStrategies) {
      const hash = await liquidatorsRegistry.write._resetRedemptionStrategies([strategies, inputTokens, outputTokens]);
      console.log("waiting for tx ", hash);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("_resetRedemptionStrategies: ", hash);
    } else {
      console.log("no redemption strategies to configure in the liquidators registry");
    }
  }

  {
    // UniswapV3 Fees
    const fees: number[] = [];
    let inputTokens: string[] = [];
    let outputTokens: string[] = [];
    const uniswapV3Fees = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Fees;
    for (const inputToken in uniswapV3Fees) {
      for (const outputToken in uniswapV3Fees[inputToken]) {
        inputTokens.push(inputToken);
        outputTokens.push(outputToken);
        fees.push(uniswapV3Fees[inputToken][outputToken]);
      }
    }

    const matchingFees = await liquidatorsRegistry.read.uniswapPairsFeesMatch([inputTokens, outputTokens, fees]);

    if (!matchingFees) {
      const hash = await liquidatorsRegistry.write._setUniswapV3Fees([inputTokens, outputTokens, fees]);
      console.log("waiting for tx ", hash);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("_setUniswapV3Fees: ", hash);
    } else {
      console.log(`UniV3 fees don't need to be updated`);
    }
    // Custom UniV3 Routers
    const routers: string[] = [];
    inputTokens = [];
    outputTokens = [];

    const assetSpecificRouters = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Routers;
    for (const inputToken in assetSpecificRouters) {
      for (const outputToken in assetSpecificRouters[inputToken]) {
        inputTokens.push(inputToken);
        outputTokens.push(outputToken);
        const router = assetSpecificRouters[inputToken][outputToken];
        if (!router)
          throw new Error(
            `missing router address in the chain specific params for in/out tokens ${inputToken} ${outputTokens}`
          );
        routers.push(router);
      }
    }

    const matchingRouters = await liquidatorsRegistry.read.uniswapPairsRoutersMatch([
      inputTokens,
      outputTokens,
      routers
    ]);

    if (!matchingRouters) {
      const hash = await liquidatorsRegistry.write._setUniswapV3Routers([inputTokens, outputTokens, routers]);
      console.log("waiting for tx ", hash);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("_setUniswapV3Router: ", hash);
    } else {
      console.log(`UniV3 routers don't need to be updated`);
    }
  }
};
