/**
 * Token List
 */
export interface TokenList {
  keywords: string[];
  logoURI: string;
  name: string;
  timestamp: string;
  tokens: Token[];
  version: {
    major: number;
    minor: number;
    patch: 0;
  };
}

/**
 * Token
 */
export interface Token {
  amount?: string;
  allowance?: string;
  symbolPair?: string;
  chainId: number;
  contractHash: string;
  decimals: number;
  logoURI: string;
  name: string;
  packageHash: string;
  symbol: string;
  priceUSD?: string;
  optApproval?: string;
}

/**
 * Path Reserve Response
 */
export interface PathReservesResponse {
  message: string;
  reserve0: string;
  reserve1: string;
  success: boolean;
}

/**
 * Path Response
 */
export interface PathResponse {
  message: string;
  path: string[];
  pathwithcontractHash: string[];
  success: boolean;
}

/**
 * Deploy Wasm Data response
 */
export interface DeployWasmDataResponse {
  message: string;
  wasmData: any;
  success: boolean;
}

/**
 * Allowance Against Owner And Spender response
 */
export interface AllowanceAgainstOwnerAndSpenderResponse {
  allowance: string;
  message: string;
  success: boolean;
}

/**
 * Allowance Against Owner And Spender Pair Contract response
 */
export interface AllowanceAgainstOwnerAndSpenderPairContractResponse {
  allowance: string;
  message: string;
  success: boolean;
}

/**
 * Liquidity Against User And Pair response
 */
export interface LiquidityAgainstUserAndPairResponse {
  liquidity: string;
  message: string;
  success: boolean;
}

/**
 * Balance Against User response
 */
export interface BalanceAgainstUserResponse {
  balance: string;
  message: string;
  success: boolean;
}

/**
 * Pair Token
 */
export interface PairToken {
  derivedETH: string;
  id: string;
  name: string;
  symbol: string;
  totalLiquidity: string;
}

/**
 * Pair
 */
export interface Pair {
  createdAtBlockNumber: string;
  createdAtTimestamp: number;
  id: string;
  liquidityProviderCount: string; //CHECK: not received from the api and is not used in the code
  reserve0: string;
  reserve1: string;
  totalReserve0?: string; //CHECK: not received from the api but used in the code
  totalReserve1?: string; //CHECK: not received from the api but used in the code
  reserveETH: string;
  reserveUSD: string;
  token0: PairToken;
  token1: PairToken;
  token0Price: string;
  token1Price: string;
  totalSupply: string;
  trackedReserveETH: string;
  txCount: string;
  untrackedVolumeUSD: string;
  volumeToken0: string; //
  volumeToken1: string; //
  volumeUSD: string;

  // CHECK: The following values are received from the api, but are not currently used.

  // oneDayVolumeUSD: number; //0;
  // oneWeekVolumeUSD: number; //22018646833.744995;
  // volumeChangeUSD: number; //0;
  // oneDayVolumeUntracked: number; //0;
  // oneWeekVolumeUntracked: number; //22018646833.744995;
  // volumeChangeUntracked: number; //0;
  // trackedReserveUSD: number; //NaN;
  // liquidityChangeUSD: number; //-0.026542998676653575;
}

/**
 * Pair List response
 */
export interface PairListResponse {
  pairList: Pair[];
  message: string;
  success: boolean;
}

/**
 * User Pairs
 */
export interface UserPair {
  id: string;
  pair: string;
  reserve0: string;
  reserve1: string;
}

/**
 * Pair Against User response
 */
export interface PairAgainstUserResponse {
  pairsdata: Pair[];
  userpairs: UserPair[];
  message: string;
  success: boolean;
}

/**
 * Pair by id and block
 */
export interface PairByIdAndBlock {
  id: string;
  reserveUSD: string;
  trackedReserveETH: string;
  volumeUSD: string;
  untrackedVolumeUSD: string;
}

/**
 *
 */
export interface MinimumReceive {
  secondTokenReturn: number;
  minAmountReturn: string;
}

export const enum Network {
  CASPER_TESTNET = 'casper-test',
  CASPER_MAINNET = 'casper',
  CASPER_INTEGRATION = 'integration-test',
  NONE = 'none',
}