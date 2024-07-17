import { task, types } from "hardhat/config";
import { Address, getAddress, zeroAddress } from "viem";

task("flywheel:deploy-static-rewards-fw", "Deploy static rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("rewardToken", "Reward token of flywheel", undefined, types.string)
  .addParam("strategies", "address of strategy for which to enable the flywheel", undefined, types.string)
  .addParam("booster", "Kind of booster flywheel to use", "LooplessFlywheelBooster", types.string)
  .addParam("pool", "comptroller to which to add the flywheel", undefined, types.string)
  .setAction(
    async ({ signer, name, rewardToken, strategies, pool, booster }, { viem, deployments, run, getNamedAccounts }) => {
      const { deployer } = await getNamedAccounts();
      const publicClient = await viem.getPublicClient();

      const flywheelBooster = await viem.getContractAt(booster, (await deployments.get(booster)).address as Address);

      console.log({ signer, name, rewardToken, strategies, pool });
      const flywheel = await deployments.deploy(`IonicFlywheel_${name}`, {
        contract: "IonicFlywheel",
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [rewardToken, zeroAddress, flywheelBooster.address, deployer]
            }
          },
          owner: deployer
        },
        waitConfirmations: 1
      });

      console.log(`Deployed flywheel: ${flywheel.address}`);
      const rewards = await run("flywheel:deploy-static-rewards", { flywheel: flywheel.address, signer, name });
      console.log(`Deployed rewards: ${rewards.address}`);
      const _flywheel = await viem.getContractAt("IonicFlywheel", flywheel.address as Address);
      const tx = await _flywheel.write.setFlywheelRewards([rewards.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log(`Set rewards (${rewards.address}) to flywheel (${flywheel.address})`);
      const strategyAddresses = strategies.split(",");
      for (const strategy of strategyAddresses) {
        console.log(`Adding strategy ${strategy} to flywheel ${flywheel.address}`);
        await run("flywheel:add-strategy-for-rewards", { flywheel: flywheel.address, strategy });
        console.log(`Added strategy (${strategy}) to flywheel (${flywheel.address})`);
      }
      await run("flywheel:add-to-pool", { flywheel: flywheel.address, pool });
      console.log(`Added flywheel (${flywheel.address}) to pool (${pool})`);
    }
  );

task("flywheel:deploy-static-rewards", "Deploy static rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("flywheel", "flywheel to which to add the rewards contract", undefined, types.string)
  .setAction(async ({ signer, name, flywheel }, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewards = await deployments.deploy(`WithdrawableFlywheelStaticRewards_${name}`, {
      contract: "WithdrawableFlywheelStaticRewards",
      from: deployer,
      log: true,
      args: [
        flywheel, // flywheel
        deployer, // owner
        zeroAddress // Authority
      ],
      waitConfirmations: 1
    });

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);

    const tx = await sdk.setFlywheelRewards(flywheel, rewards.address);
    await tx.wait();
    return rewards;
  });

task("flywheel:add-strategy-for-rewards", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("strategy", "address of strategy", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    let flywheelAddress, strategyAddress;

    try {
      flywheelAddress = getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      strategyAddress = getAddress(taskArgs.strategy);
    } catch {
      throw `Invalid 'strategy': ${taskArgs.strategy}`;
    }

    const flywheel = await viem.getContractAt("IonicFlywheel", flywheelAddress);
    const addTx = await flywheel.write.addStrategyForRewards([strategyAddress]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log(addTx);
  });

task("flywheel:add-to-pool", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    let flywheelAddress, poolAddress;

    try {
      flywheelAddress = getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      poolAddress = getAddress(taskArgs.pool);
    } catch {
      throw `Invalid 'pool': ${taskArgs.pool}`;
    }

    const comptroller = await viem.getContractAt("Comptroller", poolAddress);
    const addTx = await comptroller.write._addRewardsDistributor([flywheelAddress]);

    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log({ addTx });
  });
