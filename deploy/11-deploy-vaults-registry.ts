import { DeployFunction } from "hardhat-deploy/types";

import { chainDeployConfig } from "../chainDeploy";
import { Hash } from "viem";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient();

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  // OPTIMIZED VAULTS
  // Deploy vaults registry
  if (chainId !== 1 && chainId !== 59144) {
    try {
      console.log("Deploying the optimized APR vaults registry");
      const vaultsRegistry = await deployments.deploy("OptimizedVaultsRegistry", {
        from: deployer,
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: []
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: multisig
        },
        waitConfirmations: 1
      });
      if (vaultsRegistry.transactionHash)
        await publicClient.waitForTransactionReceipt({ hash: vaultsRegistry.transactionHash as Hash });
      console.log("OptimizedVaultsRegistry: ", vaultsRegistry.address);
    } catch (error) {
      console.error("Could not deploy:", error);
    }
  }
};

func.tags = ["prod", "deploy-vaults"];

export default func;
