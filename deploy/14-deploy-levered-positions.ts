import { DeployFunction } from "hardhat-deploy/types";
import { Address, encodeFunctionData, Hash, zeroAddress } from "viem";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { logTransaction } from "../chainDeploy/helpers/logging";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  let tx: Hash;
  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address
  );
  const liquidatorsRegistry = await viem.getContractAt(
    "LiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address
  );

  //// LEVERED POSITIONS FACTORY
  const lpfDep = await deployments.deploy("LeveredPositionFactory", {
    from: deployer,
    log: true,
    args: [fuseFeeDistributor.address, liquidatorsRegistry.address, chainDeployParams.blocksPerYear],
    waitConfirmations: 1,
    skipIfAlreadyDeployed: true
  });

  if (lpfDep.transactionHash) await publicClient.waitForTransactionReceipt({ hash: lpfDep.transactionHash as Hash });
  console.log("LeveredPositionFactory: ", lpfDep.address);

  const lpfExt1Dep = await deployments.deploy("LeveredPositionFactoryFirstExtension", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (lpfExt1Dep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: lpfExt1Dep.transactionHash as Hash });
  console.log("LeveredPositionFactoryFirstExtension: ", lpfExt1Dep.address);

  const lpfExt2Dep = await deployments.deploy("LeveredPositionFactorySecondExtension", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: 1
  });
  if (lpfExt2Dep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: lpfExt2Dep.transactionHash as Hash });
  console.log("LeveredPositionFactorySecondExtension: ", lpfExt2Dep.address);

  const leveredPositionFactory = await viem.getContractAt(
    "LeveredPositionFactory",
    (await deployments.get("LeveredPositionFactory")).address as Address
  );

  const currentLPFExtensions = await leveredPositionFactory.read._listExtensions();

  console.log("currentLPFExtensions: ", currentLPFExtensions.join(", "));

  if (currentLPFExtensions.length == 1) {
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Replace LeveredPositionFactory First Extension",
        encodeFunctionData({
          abi: leveredPositionFactory.abi,
          functionName: "_registerExtension",
          args: [lpfExt1Dep.address as Address, currentLPFExtensions[0]]
        })
      );
    } else {
      tx = await leveredPositionFactory.write._registerExtension([
        lpfExt1Dep.address as Address,
        currentLPFExtensions[0]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("replaced the LeveredPositionFactory first extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Register LeveredPositionFactory Second Extension",
        encodeFunctionData({
          abi: leveredPositionFactory.abi,
          functionName: "_registerExtension",
          args: [lpfExt2Dep.address as Address, zeroAddress]
        })
      );
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt2Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory second extension: ", tx);
    }
  } else if (currentLPFExtensions.length == 2) {
    if (lpfExt1Dep.address.toLowerCase() != currentLPFExtensions[0].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[0]} with ${lpfExt1Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        logTransaction(
          "Replace LeveredPositionFactory First Extension",
          encodeFunctionData({
            abi: leveredPositionFactory.abi,
            functionName: "_registerExtension",
            args: [lpfExt1Dep.address as Address, currentLPFExtensions[0]]
          })
        );
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt1Dep.address as Address,
          currentLPFExtensions[0]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory first extension: ", tx);
      }
    }
    if (lpfExt2Dep.address.toLowerCase() != currentLPFExtensions[1].toLowerCase()) {
      console.log(`replacing ${currentLPFExtensions[1]} with ${lpfExt2Dep.address}`);
      if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        logTransaction(
          "Replace LeveredPositionFactory Second Extension",
          encodeFunctionData({
            abi: leveredPositionFactory.abi,
            functionName: "_registerExtension",
            args: [lpfExt2Dep.address as Address, currentLPFExtensions[1]]
          })
        );
      } else {
        tx = await leveredPositionFactory.write._registerExtension([
          lpfExt2Dep.address as Address,
          currentLPFExtensions[1]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("replaced the LeveredPositionFactory second extension: ", tx);
      }
    }
  } else if (currentLPFExtensions.length == 0) {
    console.log(`no LeveredPositionFactory extensions configured, adding them`);
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Register LeveredPositionFactory First Extension",
        encodeFunctionData({
          abi: leveredPositionFactory.abi,
          functionName: "_registerExtension",
          args: [lpfExt1Dep.address as Address, zeroAddress]
        })
      );
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt1Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory first extension: ", tx);
    }
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Register LeveredPositionFactory Second Extension",
        encodeFunctionData({
          abi: leveredPositionFactory.abi,
          functionName: "_registerExtension",
          args: [lpfExt2Dep.address as Address, zeroAddress]
        })
      );
    } else {
      tx = await leveredPositionFactory.write._registerExtension([lpfExt2Dep.address as Address, zeroAddress]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("registered the LeveredPositionFactory second extension: ", tx);
    }
  } else {
    console.log(`no LeveredPositionFactory extensions to update`);
  }

  const lr = await leveredPositionFactory.read.liquidatorsRegistry();
  if (lr.toLowerCase() != liquidatorsRegistry.address.toLowerCase()) {
    if ((await leveredPositionFactory.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Set LiquidatorsRegistry Address",
        encodeFunctionData({
          abi: leveredPositionFactory.abi,
          functionName: "_setLiquidatorsRegistry",
          args: [liquidatorsRegistry.address]
        })
      );
    } else {
      tx = await leveredPositionFactory.write._setLiquidatorsRegistry([liquidatorsRegistry.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("updated the LiquidatorsRegistry address in the LeveredPositionFactory", tx);
    }
  }

  //// LEVERED POSITIONS LENS
  try {
    const lpLens = await deployments.deploy("LeveredPositionsLens", {
      from: deployer,
      log: true,
      waitConfirmations: 1,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [leveredPositionFactory.address]
          },
          onUpgrade: {
            methodName: "reinitialize",
            args: [leveredPositionFactory.address]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      }
    });
    if (lpLens.transactionHash) await publicClient.waitForTransactionReceipt({ hash: lpLens.transactionHash as Hash });
    console.log("LeveredPositionsLens: ", lpLens.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  //// AUTHORITIES REGISTRY
  try {
    await deployments.deploy("AuthoritiesRegistry", {
      from: deployer,
      args: [],
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [leveredPositionFactory.address]
          },
          onUpgrade: {
            methodName: "reinitialize",
            args: [leveredPositionFactory.address]
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy",
        owner: multisig
      },
      waitConfirmations: 1
    });
  } catch (error) {
    console.error("Could not deploy:", error);
  }

  const authoritiesRegistry = await viem.getContractAt(
    "AuthoritiesRegistry",
    (await deployments.get("AuthoritiesRegistry")).address as Address
  );

  const ffdAuthRegistry = await fuseFeeDistributor.read.authoritiesRegistry();
  if (ffdAuthRegistry.toLowerCase() != authoritiesRegistry.address.toLowerCase()) {
    // set the address in the FFD
    if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Set AuthoritiesRegistry in FeeDistributor",
        encodeFunctionData({
          abi: fuseFeeDistributor.abi,
          functionName: "reinitialize",
          args: [authoritiesRegistry.address]
        })
      );
    } else {
      tx = await fuseFeeDistributor.write.reinitialize([authoritiesRegistry.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the auth registry in the FFD`);
    }
  }
  const leveredPosFactoryAr = await authoritiesRegistry.read.leveredPositionsFactory();
  if (leveredPosFactoryAr.toLowerCase() != leveredPositionFactory.address.toLowerCase()) {
    // set the address in the AR
    if ((await authoritiesRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Set LeveredPositionsFactory in AuthoritiesRegistry",
        encodeFunctionData({
          abi: authoritiesRegistry.abi,
          functionName: "reinitialize",
          args: [leveredPositionFactory.address]
        })
      );
    } else {
      tx = await authoritiesRegistry.write.reinitialize([leveredPositionFactory.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the levered positions factory in the auth registry`, tx);
    }
  }
  ////
};

func.tags = ["prod", "deploy-levered-positions"];

export default func;
