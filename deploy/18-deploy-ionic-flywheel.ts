import { DeployFunction } from "hardhat-deploy/types";
import { Address, parseEther } from "viem";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments }) => {
  const publicClient = await viem.getPublicClient();
  const { deployer } = await getNamedAccounts();

  // upgrade any of the pools if necessary
  // the markets are also autoupgraded with this task
  try {
    await run("pools:all:upgrade");
  } catch (error) {
    console.error("Could not upgrade:", error);
  }

  const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address);

  // NOTE: not all markets should be approved, so we hardcode market for which flywheel is deployed
  //const comptroller = await viem.getContractAt("Comptroller", (await deployments.get("Comptroller")).address as Address);
  //const markets = await comptroller.read.getAllMarkets();
  const ionbsdETH = "0x3d9669de9e3e98db41a1cbf6dc23446109945e3c";
  const ioneUSD = "0x9c2a4f9c5471fd36be3bbd8437a33935107215a1";
  const IONIC = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";
  const markets = `${ionbsdETH},${ioneUSD}`;

  const ionToken = await viem.getContractAt("EIP20Interface", IONIC);
  await ionToken.write.transfer([ionbsdETH, parseEther("105263.157895")]);
  await ionToken.write.transfer([ioneUSD, parseEther("114416.475973")]);

  /*
  // NOTE: change name and reward token
  await run("flywheel:deploy-dynamic-rewards-fw", { name: "RSR", rewardToken: "RSR_TOKEN_ADDRESS", booster: "", strategies: markets, pool: fpd.address });

  const flywheel = await viem.getContractAt("IonicFlywheel", (await deployments.get("IonicFlywheel")).address as Address);
  await run("approve-market-flywheel", { fwAddress: flywheel.address, markets: markets });
  
  const tx = await flywheel.write.updateFeeSettings([0, deployer.address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  */
  await run("flywheel:deploy-borrow-booster", { name: "Booster" });

  // NOTE: change name and reward token
  await run("flywheel:deploy-dynamic-rewards-fw", {
    name: "Borrow_ION",
    rewardToken: IONIC,
    booster: "IonicFlywheelBorrowBooster",
    strategies: markets,
    pool: fpd.address
  });

  const flywheelBorrow = await viem.getContractAt(
    "IonicFlywheelBorrow",
    (await deployments.get("IonicFlywheelBorrow")).address as Address
  );
  await run("approve-market-flywheel", { fwAddress: flywheelBorrow.address, markets: markets });

  const txBorrow = await flywheelBorrow.write.updateFeeSettings([0n, deployer as Address]);
  await publicClient.waitForTransactionReceipt({ hash: txBorrow });
};

func.tags = ["prod", "deploy-ionic-flywheel"];

export default func;
