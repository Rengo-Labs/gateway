import { TransactionResponse } from '@solana/web3.js';
import {
  CustomTransactionReceipt,
  CustomTransactionResponse,
  NetworkSelectionRequest,
} from '../../services/common-interfaces';

export type CasperTransactionResponse = TransactionResponse;

export interface CasperBalanceRequest {
  address: string; // the user's Cosmos address as Bech32
  tokenSymbols: string[]; // a list of token symbol
}

export interface CasperBalanceRequest extends NetworkSelectionRequest {
  address: string; // the user's Casper address as Base58
  tokenSymbols: string[]; // a list of token symbol
}

export interface CasperBalanceResponse {
  network: string;
  timestamp: number;
  latency: number;
  balances: Record<string, string>; // the balance should be a string encoded number
}

export interface CasperTokenRequest extends NetworkSelectionRequest {
  token: string;
  address: string;
  tokenSymbols: string[]; // the token symbol the spender will be approved for
}

export interface CasperTokenResponse {
  network: string;
  timestamp: number;
  token: string; // the token symbol the spender will be approved for
  mintAddress: string;
  accountAddress?: string;
  amount: string | null;
}

export interface CasperPollRequest extends NetworkSelectionRequest {
  txHash: string;
}

export enum TransactionResponseStatusCode {
  FAILED = -1,
  CONFIRMED = 1,
}

export interface CasperPollResponse {
  network: string;
  timestamp: number;
  currentBlock: number;
  txHash: string;
  txStatus: number;
  txBlock: number;
  txData: CustomTransactionResponse | null;
  txReceipt: CustomTransactionReceipt | null;
}
