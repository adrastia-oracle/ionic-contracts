import { task, types } from "hardhat/config";
import { Address, Hash, parseUnits, zeroAddress } from "viem";

export default task("market:unsupport", "Unsupport a market")
  .addParam("pool", "Comptroller Address", undefined, types.string)
  .addParam("market", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async ({ pool, market }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const comptroller = await viem.getContractAt("IonicComptroller", pool as Address);
    const tx = await comptroller.write._unsupportMarket([market]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("Unsupported market with status:", receipt.status);
  });

task("market:set:ltv", "Set the LTV (loan to value / collateral factor) of a market")
  .addParam("marketAddress", "Address of the market", undefined, types.string)
  .addParam("ltv", "The LTV as a floating point value between 0 and 1", undefined, types.string)
  .setAction(async ({ marketAddress, ltv }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const market = await viem.getContractAt("ICErc20", marketAddress);
    const poolAddress = await market.read.comptroller();
    const pool = await viem.getContractAt("IonicComptroller", poolAddress as Address);

    const ltvMantissa = parseUnits(ltv, 18);
    console.log(`will set the LTV of market ${marketAddress} to ${ltvMantissa}`);

    const tx = await pool.write._setCollateralFactor([marketAddress, ltvMantissa]);
    console.log(`_setCollateralFactor tx ${tx}`);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`mined tx ${tx}`);
  });

task("market:mint-pause", "Pauses minting on a market")
  .addParam("markets", "The address of the CTokens", undefined, types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    let tx: Hash;

    const markets: Address[] = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = await viem.getContractAt("ICErc20", marketAddress);
      const comptroller = await market.read.comptroller();
      const pool = await viem.getContractAt("IonicComptroller", comptroller);

      const currentPauseGuardian = await pool.read.pauseGuardian();
      if (currentPauseGuardian === zeroAddress) {
        tx = await pool.write._setPauseGuardian([deployer as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set the pause guardian to ${deployer}`);
      }

      const isPaused: boolean = await pool.read.mintGuardianPaused([market.address]);
      console.log(`The market at ${market.address} minting pause is currently set to ${isPaused}`);

      if (isPaused != taskArgs.paused) {
        tx = await pool.write._setMintPaused([market.address, taskArgs.paused]);
        await publicClient.waitForTransactionReceipt({ hash: tx });

        console.log(`Market mint pause tx ${tx}`);
      } else {
        console.log(`No need to set the minting pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.read.mintGuardianPaused([market.address]);

      console.log(`The market at ${market.address} minting pause has been to ${isPausedAfter}`);
    }
  });

task("markets:borrow-pause", "Pauses borrowing on a market")
  .addParam("markets", "The address of the CToken", undefined, types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const markets: Address[] = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = await viem.getContractAt("ICErc20", marketAddress);
      const comptroller = await market.read.comptroller();
      const pool = await viem.getContractAt("IonicComptroller", comptroller);

      const currentPauseGuardian = await pool.read.pauseGuardian();
      console.log(`pool ${pool.address} guardian ${currentPauseGuardian}`);
      if (currentPauseGuardian === zeroAddress) {
        tx = await pool.write._setPauseGuardian([deployer as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set the pause guardian to ${deployer}`);
      }

      const isPaused: boolean = await pool.read.borrowGuardianPaused([market.address]);
      if (isPaused != taskArgs.paused) {
        console.log(`setting market ${market.address} pause to ${taskArgs.paused}`);
        tx = await pool.write._setBorrowPaused([market.address, taskArgs.paused]);
        console.log(`waiting for tx ${tx}`);
        await publicClient.waitForTransactionReceipt({ hash: tx });

        console.log(`Market borrow pause tx ${tx}`);
      } else {
        console.log(`No need to set the borrow pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.read.borrowGuardianPaused([market.address]);

      console.log(`The market at ${market.address} borrowing pause has been to ${isPausedAfter}`);
    }
  });

task("markets:all:pause", "Pauses borrowing on a market")
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts, deployments, run }) => {
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    const [, poolData] = await poolDirectory.read.getActivePools();

    for (const pool of poolData) {
      const poolExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);

      const markets = await poolExtension.read.getAllMarkets();

      await run("markets:borrow-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
      await run("market:mint-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
    }
  });
