import { Address, encodeFunctionData, PublicClient, WalletClient, zeroAddress } from "viem";
import { addTransaction } from "../logging";
import { masterPriceOracleAbi } from "../../../generated";
import type { GetContractReturnType } from "@nomicfoundation/hardhat-viem/types.js";

export async function addUnderlyingsToMpo(
  mpo: GetContractReturnType<typeof masterPriceOracleAbi>,
  underlyingsToCheck: Address[],
  oracleAddress: Address,
  deployer: string,
  publicClient: PublicClient,
  walletClient: WalletClient
) {
  const oracles: Address[] = [];
  const underlyings: Address[] = [];
  for (const underlying of underlyingsToCheck) {
    const currentOracle = await mpo.read.oracles([underlying]);
    if (currentOracle === zeroAddress || currentOracle !== oracleAddress) {
      oracles.push(oracleAddress);
      underlyings.push(underlying);
    }
  }

  if (underlyings.length) {
    if ((await mpo.read.admin()).toLowerCase() === deployer.toLowerCase()) {
      const tx = await mpo.write.add([underlyings, oracles]);
      console.log("tx: ", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Master Price Oracle updated oracles for tokens ${underlyings.join(",")} at ${tx}`);
    } else {
      const tx = await walletClient.prepareTransactionRequest({
        chain: walletClient.chain,
        account: await mpo.read.admin(),
        to: mpo.address,
        data: encodeFunctionData({
          abi: mpo.abi,
          functionName: "add",
          args: [underlyings, oracles]
        })
      });
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "_oracles", type: "address[]" }
          ],
          name: "add",
          payable: false
        },
        contractInputsValues: {
          underlyings: underlyings,
          _oracles: oracles
        }
      });

      console.log(`Logged Transaction for Master Price Oracle update for tokens ${underlyings.join(",")}`);
    }
  }
}

export async function addUnderlyingsToMpoFallback(
  mpo: GetContractReturnType<typeof masterPriceOracleAbi>,
  underlyingsToCheck: Address[],
  oracleAddress: Address,
  deployer: Address,
  publicClient: PublicClient,
  walletClient: WalletClient
) {
  const oracles: Address[] = [];
  const underlyings: Address[] = [];
  for (const underlying of underlyingsToCheck) {
    const currentOracle = await mpo.read.fallbackOracles([underlying]);
    if (currentOracle === zeroAddress || currentOracle !== oracleAddress) {
      oracles.push(oracleAddress);
      underlyings.push(underlying);
    }
  }

  if (underlyings.length) {
    if ((await mpo.read.admin()).toLowerCase() === deployer.toLowerCase()) {
      const tx = await mpo.write.addFallbacks([underlyings, oracles]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Master Price Oracle updated fallbacks for tokens ${underlyings.join(",")} at tx ${tx}.`);
    } else {
      const tx = await walletClient.prepareTransactionRequest({
        chain: walletClient.chain,
        account: await mpo.read.admin(),
        to: mpo.address,
        data: encodeFunctionData({
          abi: mpo.abi,
          functionName: "addFallbacks",
          args: [underlyings, oracles]
        })
      });
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "_oracles", type: "address[]" }
          ],
          name: "addFallbacks",
          payable: false
        },
        contractInputsValues: {
          underlyings: underlyings,
          _oracles: oracles
        }
      });
      console.log(`Logged Transaction for Master Price Oracle update fallbacks for tokens ${underlyings.join(",")}.`);
    }
  }
}
