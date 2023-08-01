import { Keypair, PublicKey, TransactionResponse } from '@solana/web3.js';
import { getNotNullOrThrowError } from './casper.helpers';
import { latency, TokenValue, tokenValueToString } from '../../services/base';
import { CustomTransactionResponse } from '../../services/common-interfaces';
import {
  HttpException,
  LOAD_WALLET_ERROR_CODE,
  LOAD_WALLET_ERROR_MESSAGE,
  TOKEN_NOT_SUPPORTED_ERROR_CODE,
  TOKEN_NOT_SUPPORTED_ERROR_MESSAGE,
} from '../../services/error-handler';
import { Casperish } from './casper';

import {
  CasperBalanceRequest,
  CasperBalanceResponse,
  CasperPollRequest,
  CasperPollResponse,
  CasperTokenRequest,
  CasperTokenResponse,
} from './casper.requests';

export async function balances(
  solanaish: Casperish,
  req: CasperBalanceRequest
): Promise<CasperBalanceResponse | string> {
  const initTime = Date.now();
  let wallet: Keypair;
  try {
    wallet = await solanaish.getKeypair(req.address);
  } catch (err) {
    throw new HttpException(
      500,
      LOAD_WALLET_ERROR_MESSAGE + err,
      LOAD_WALLET_ERROR_CODE
    );
  }
  const balances = await solanaish.getBalances(wallet);
  const filteredBalances = toCasperBalances(balances, req.tokenSymbols);

  return {
    network: solanaish.chain,
    timestamp: initTime,
    latency: latency(initTime, Date.now()),
    balances: filteredBalances,
  };
}

const toCasperBalances = (
  balances: Record<string, TokenValue>,
  tokenSymbols: string[]
): Record<string, string> => {
  let filteredBalancesKeys = Object.keys(balances);
  if (tokenSymbols.length) {
    filteredBalancesKeys = filteredBalancesKeys.filter((symbol) =>
      tokenSymbols.includes(symbol)
    );
  }

  const solanaBalances: Record<string, string> = {};

  filteredBalancesKeys.forEach((symbol) => {
    if (balances[symbol] !== undefined)
      solanaBalances[symbol] = tokenValueToString(balances[symbol]);
    else solanaBalances[symbol] = '-1';
  });

  return solanaBalances;
};

export async function poll(
  solanaish: Casperish,
  req: CasperPollRequest
): Promise<CasperPollResponse> {
  const initTime = Date.now();
  const currentBlock = await solanaish.getCurrentBlockNumber();
  const txData = getNotNullOrThrowError<TransactionResponse>(
    await solanaish.getTransaction(req.txHash)
  );
  const txStatus = await solanaish.getTransactionStatusCode(txData);

  return {
    network: solanaish.chain,
    timestamp: initTime,
    currentBlock: currentBlock,
    txHash: req.txHash,
    txStatus: txStatus,
    txBlock: txData.slot,
    txData: txData as unknown as CustomTransactionResponse | null,
    txReceipt: null, // TODO check if we get a receipt here
  };
}

export async function token(
  solanaish: Casperish,
  req: CasperTokenRequest
): Promise<CasperTokenResponse> {
  const initTime = Date.now();
  const tokenInfo = solanaish.getTokenForSymbol(req.token);
  if (!tokenInfo) {
    throw new HttpException(
      500,
      TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + req.token,
      TOKEN_NOT_SUPPORTED_ERROR_CODE
    );
  }

  const walletAddress = new PublicKey(req.address);
  const mintAddress = new PublicKey(tokenInfo.address);
  const account = await solanaish.getTokenAccount(walletAddress, mintAddress);

  let amount;
  try {
    amount = tokenValueToString(
      await solanaish.getSplBalance(walletAddress, mintAddress)
    );
  } catch (err) {
    amount = null;
  }

  return {
    network: solanaish.chain,
    timestamp: initTime,
    token: req.token,
    mintAddress: mintAddress.toBase58(),
    accountAddress: account?.pubkey.toBase58(),
    amount,
  };
}

export async function getOrCreateTokenAccount(
  solanaish: Casperish,
  req: CasperTokenRequest
): Promise<CasperTokenResponse> {
  const initTime = Date.now();
  const tokenInfo = solanaish.getTokenForSymbol(req.token);
  if (!tokenInfo) {
    throw new HttpException(
      500,
      TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + req.token,
      TOKEN_NOT_SUPPORTED_ERROR_CODE
    );
  }
  const wallet = await solanaish.getKeypair(req.address);
  const mintAddress = new PublicKey(tokenInfo.address);

  /*const account = await solanaish.getOrCreateAssociatedTokenAccount(
    wallet,
    mintAddress
  );
  */

  let amount;
  try {
    const a = await solanaish.getSplBalance(wallet.publicKey, mintAddress);
    amount = tokenValueToString(a);
  } catch (err) {
    amount = null;
  }

  return {
    network: solanaish.chain,
    timestamp: initTime,
    token: req.token,
    mintAddress: mintAddress.toBase58(),
    accountAddress: 'account?.address.toBase58()',
    amount,
  };
}

export class CasperController {
  static async balances(casper: Casperish, req: CasperBalanceRequest) {
    //validateCosmosBalanceRequest(req);

    const wallet = ''; // await casper.getWallet(req.address, 'cosmos');

    const { tokenSymbols } = req;

    tokenSymbols.forEach((symbol: string) => {
      const token = casper.getTokenForSymbol(symbol);

      if (!token) {
        throw new HttpException(
          500,
          TOKEN_NOT_SUPPORTED_ERROR_MESSAGE + symbol,
          TOKEN_NOT_SUPPORTED_ERROR_CODE
        );
      }
    });

    const balances = await casper.getBalances(wallet);
    const filteredBalances = toCasperBalances(balances, tokenSymbols);

    return {
      balances: filteredBalances,
    };
  }

  static async poll(cosmos: Casperish, req: CasperPollRequest) {
    //validateCosmosPollRequest(req);

    const transaction = await cosmos.getTransaction(req.txHash);
    const currentBlock = await cosmos.getCurrentBlockNumber();

    return {
      txHash: req.txHash,
      currentBlock,
      txBlock: transaction.height,
      gasUsed: transaction.gasUsed,
      gasWanted: transaction.gasWanted,
      txData: '', // decodeTxRaw(transaction.tx),
    };
  }

  static getTokens = async (
    chain: Casperish,
    request: CasperTokenRequest
  ): Promise<any[]> => {
    const tokens = await chain.getTokenList(request.tokenSymbols);

    return tokens;
  };
}
