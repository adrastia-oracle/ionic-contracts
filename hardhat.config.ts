import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";

dotenv();

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: { default: 0 }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    local: {
      accounts: [process.env.DEPLOYER!],
      url: "http://localhost:8545",
      saveDeployments: false
    },
    mode: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://mainnet.mode.network",
      accounts: [process.env.DEPLOYER!]
    },
    base: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://mainnet.base.org",
      accounts: [process.env.DEPLOYER!],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/api?",
          apiKey: process.env.ETHERSCAN_API_KEY_BASE
        }
      }
    },
    optimism: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://mainnet.optimism.io",
      accounts: [process.env.DEPLOYER!]
    },
    bob: {
      url: process.env.OVERRIDE_RPC_URL ?? "https://rpc.gobob.xyz",
      accounts: [process.env.DEPLOYER!]
    }
  }
};

export default config;
