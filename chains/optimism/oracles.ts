import { OracleTypes } from "../types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [
  ...baseOracles,
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.PythPriceOracle
  // OracleTypes.RedstoneAdapterPriceOracle
];

export default oracles;
