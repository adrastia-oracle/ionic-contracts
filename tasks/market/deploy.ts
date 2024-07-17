import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, parseAbiParameters, parseEther } from "viem";

// import { assets as bobAssets } from "../../../chains/src/bob/assets";
import { MarketConfig } from "../../chainDeploy";

// task("markets:deploy:bob:main", "deploy bob main market").setAction(async (_, { ethers, run }) => {
//   const COMPTROLLER = "0x9cFEe81970AA10CC593B83fB96eAA9880a6DF715";
//   for (const asset of bobAssets) {
//     await run("market:deploy", {
//       signer: "deployer",
//       cf: asset.initialCf,
//       underlying: asset.underlying,
//       comptroller: COMPTROLLER,
//       symbol: "ion" + asset.symbol,
//       name: `Ionic ${asset.name}`
//     });
//     const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
//     const cToken = await pool.cTokensByUnderlying(asset.underlying);
//     console.log(`Deployed ${asset.symbol} at ${cToken}`);

//     await run("market:set-supply-cap", {
//       market: cToken,
//       maxSupply: asset.initialSupplyCap
//     });

//     await run("market:set-borrow-cap", {
//       market: cToken,
//       maxBorrow: asset.initialBorrowCap
//     });
//   }
// });

// task("market:set-caps:bob:main", "Sets caps on a market").setAction(async (_, { ethers, run }) => {
//   const COMPTROLLER = "0x9cFEe81970AA10CC593B83fB96eAA9880a6DF715";
//   for (const asset of bobAssets) {
//     const pool = (await ethers.getContractAt("IonicComptroller", COMPTROLLER)) as IonicComptroller;
//     const cToken = await pool.cTokensByUnderlying(asset.underlying);
//     console.log("cToken: ", cToken, asset.symbol);

//     await run("market:set-supply-cap", {
//       market: cToken,
//       maxSupply: asset.initialSupplyCap
//     });

//     await run("market:set-borrow-cap", {
//       market: cToken,
//       maxBorrow: asset.initialBorrowCap
//     });
//   }
// });

task("market:deploy", "deploy market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("cf", "Collateral factor", "80", types.string)
  .addParam("underlying", "Asset token address", undefined, types.string)
  .addParam("comptroller", "Comptroller address", undefined, types.string)
  .addParam("symbol", "CToken symbol", undefined, types.string)
  .addParam("name", "CToken name", undefined, types.string)
  .addOptionalParam("initialSupplyCap", "Initial supply cap", undefined, types.string)
  .addOptionalParam("initialBorrowCap", "Initial borrow cap", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const comptroller = await viem.getContractAt("IonicComptroller", taskArgs.comptroller as Address);

    const delegateType = 1;
    const implementationData = "0x00";

    const config: MarketConfig = {
      underlying: taskArgs.underlying,
      comptroller: comptroller.address,
      adminFee: 10,
      collateralFactor: parseInt(taskArgs.cf),
      interestRateModel: (await deployments.get("JumpRateModel")).address as Address,
      reserveFactor: 10,
      bypassPriceFeedCheck: true,
      feeDistributor: (await deployments.get("FeeDistributor")).address as Address,
      symbol: taskArgs.symbol,
      name: taskArgs.name
    };

    const reserveFactorBN = parseEther((config.reserveFactor / 100).toString());
    const adminFeeBN = parseEther((config.adminFee / 100).toString());
    const collateralFactorBN = parseEther((config.collateralFactor / 100).toString());

    console.log("collateralFactorBN", collateralFactorBN.toString());
    const constructorData = encodeAbiParameters(
      parseAbiParameters("address,address,address,address,string,string,uint256,uint256"),
      [
        config.underlying,
        config.comptroller,
        config.feeDistributor,
        config.interestRateModel,
        config.name,
        config.symbol,
        reserveFactorBN,
        adminFeeBN
      ]
    );

    // Test Transaction
    const errorCode = await comptroller.simulate._deployMarket([
      delegateType,
      constructorData,
      implementationData,
      collateralFactorBN
    ]);
    if (errorCode.result !== 0n) {
      throw `Unable to _deployMarket: ${errorCode.result}`;
    }
    // Make actual Transaction
    const tx = await comptroller.write._deployMarket([
      delegateType,
      constructorData,
      implementationData,
      collateralFactorBN
    ]);
    console.log("tx", tx);

    // Recreate Address of Deployed Market
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    if (receipt.status !== "success") {
      throw `Failed to deploy market for ${config.underlying}`;
    }
  });
