import { Address } from "viem";
import { LeveragePoolConfig } from "../types";

const leveragePairs: LeveragePoolConfig[] = [
  {
    pool: "Main" as Address,
    pairs: [
      // ezETH
      {
        collateral: "0x59e710215d45F584f44c0FEe83DA6d43D762D857",
        borrow: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038"
      }, // usdc
      {
        collateral: "0x59e710215d45F584f44c0FEe83DA6d43D762D857",
        borrow: "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3"
      }, // usdt
      {
        collateral: "0x59e710215d45F584f44c0FEe83DA6d43D762D857",
        borrow: "0xd70254C3baD29504789714A7c69d60Ec1127375C"
      }, // wbtc
      {
        collateral: "0x59e710215d45F584f44c0FEe83DA6d43D762D857",
        borrow: "0x19f245782b1258cf3e11eda25784a378cc18c108"
      }, // mbtc
      {
        collateral: "0x59e710215d45F584f44c0FEe83DA6d43D762D857",
        borrow: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2"
      }, // weth

      // wrsETH
      {
        collateral: "0x49950319aBE7CE5c3A6C90698381b45989C99b46",
        borrow: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038"
      }, // usdc
      {
        collateral: "0x49950319aBE7CE5c3A6C90698381b45989C99b46",
        borrow: "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3"
      }, // usdt
      {
        collateral: "0x49950319aBE7CE5c3A6C90698381b45989C99b46",
        borrow: "0xd70254C3baD29504789714A7c69d60Ec1127375C"
      }, // wbtc
      {
        collateral: "0x49950319aBE7CE5c3A6C90698381b45989C99b46",
        borrow: "0x19f245782b1258cf3e11eda25784a378cc18c108"
      }, // mbtc
      {
        collateral: "0x49950319aBE7CE5c3A6C90698381b45989C99b46",
        borrow: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2"
      }, // weth

      // weETH.mode
      {
        collateral: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18",
        borrow: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038"
      }, // usdc
      {
        collateral: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18",
        borrow: "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3"
      }, // usdt
      {
        collateral: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18",
        borrow: "0xd70254C3baD29504789714A7c69d60Ec1127375C"
      }, // wbtc
      {
        collateral: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18",
        borrow: "0x19f245782b1258cf3e11eda25784a378cc18c108"
      }, // mbtc
      {
        collateral: "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18",
        borrow: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2"
      }, // weth

      // mbtc
      {
        collateral: "0x19f245782b1258cf3e11eda25784a378cc18c108",
        borrow: "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038"
      }, // usdc
      {
        collateral: "0x19f245782b1258cf3e11eda25784a378cc18c108",
        borrow: "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3"
      }, // usdt
      {
        collateral: "0x19f245782b1258cf3e11eda25784a378cc18c108",
        borrow: "0xd70254C3baD29504789714A7c69d60Ec1127375C"
      }, // wbtc
      { collateral: "0x19f245782b1258cf3e11eda25784a378cc18c108", borrow: "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2" } // mbtc
    ]
  }
];

export default leveragePairs;
