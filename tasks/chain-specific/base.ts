import { task } from "hardhat/config";
import { Address, parseEther, zeroAddress } from "viem";

task("market:base:rsr-ion-rewards", "Sets caps on a market").setAction(
  async (_, { viem, run, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    // NOTE: not all markets should be approved, so we hardcode market for which flywheel is deployed
    //const comptroller = await viem.getContractAt("Comptroller", (await deployments.get("Comptroller")).address as Address);
    //const markets = await comptroller.read.getAllMarkets();
    const ionbsdETH = "0x3d9669de9e3e98db41a1cbf6dc23446109945e3c";
    const bsdETH = "0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff";
    const ioneUSD = "0x9c2a4f9c5471fd36be3bbd8437a33935107215a1";
    const eUSD = "0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4";
    const IONIC = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";
    const pool = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
    const comptroller = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
    const markets = `${ionbsdETH},${ioneUSD}`;

    // STEP 1: upgrade markets to the new implementation
    console.log(`Upgrading market: ${ionbsdETH} to CErc20RewardsDelegate`);
    await run("market:upgrade", {
      comptroller,
      underlying: bsdETH,
      implementationAddress: (await deployments.get("CErc20RewardsDelegate")).address,
      signer: deployer
    });

    console.log(`Upgrading market: ${ioneUSD} to CErc20RewardsDelegate`);
    await run("market:upgrade", {
      comptroller,
      underlying: eUSD,
      implementationAddress: (await deployments.get("CErc20RewardsDelegate")).address,
      signer: deployer
    });
    console.log("Market upgraded");
    /*
    const ionToken = await viem.getContractAt("EIP20Interface", IONIC);
    const balance = await ionToken.read.balanceOf([ionbsdETH]);
    if (balance < parseEther("105263.157895")) {
      await ionToken.write.transfer([ionbsdETH, parseEther("105263.157895")]);
    }
    const balanceUSD = await ionToken.read.balanceOf([ioneUSD]);
    if (balanceUSD < parseEther("114416.475973")) {
      await ionToken.write.transfer([ioneUSD, parseEther("114416.475973")]);
    }
    */
    /*
    // NOTE: change name and reward token
    await run("flywheel:deploy-dynamic-rewards-fw", { name: "RSR", rewardToken: "RSR_TOKEN_ADDRESS", booster: "", strategies: markets, pool: fpd.address });

    const flywheel = await viem.getContractAt("IonicFlywheel", (await deployments.get("IonicFlywheel")).address as Address);
    await run("approve-market-flywheel", { fwAddress: flywheel.address, markets: markets });
    
    const tx = await flywheel.write.updateFeeSettings([0, deployer.address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    */
    /*
    await run("flywheel:deploy-borrow-booster", { name: "ION" });
    // NOTE: change name and reward token
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "Borrow_ION",
      rewardToken: IONIC,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: markets,
      pool
    });

    const flywheelBorrow = await viem.getContractAt(
      "IonicFlywheelBorrow",
      (await deployments.get("IonicFlywheelBorrow_Borrow_ION")).address as Address
    );
    await run("approve-market-flywheel", { fwAddress: flywheelBorrow.address, markets: markets });

    const txBorrow = await flywheelBorrow.write.updateFeeSettings([0n, deployer as Address]);
    await publicClient.waitForTransactionReceipt({ hash: txBorrow });
    */
  }
);
