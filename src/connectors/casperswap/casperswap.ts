import { UniswapishPriceError } from '../../services/error-handler';
import { CasperswapConfig } from './casperswap.config';
import routerAbi from './casperswap_router.json';
//import { ContractInterface } from '@ethersproject/contracts';

// import {
//   Percent,
//   Token,
//   CurrencyAmount,
//   Trade,
//   Pair,
//   TradeType,
// } from '@sushiswap/sdk';
//import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { ExpectedTrade, Uniswapish } from '../../services/common-interfaces';

import { BigNumber } from 'ethers';
import { percentRegexp } from '../../services/config-manager-v2';
import { logger } from '../../services/logger';
import { Casper } from '../../chains/casper/casper';

export class Casperswap implements Uniswapish {
  private static _instances: { [name: string]: Casperswap };
  private chain: Casper;
  private _router: string;
  private _routerAbi: any;
  private _gasLimitEstimate: number;
  private _ttl: number;
  private tokenList: Record<string, any> = {};
  private _ready: boolean = false;

  private constructor(chain: string, network: string) {
    console.error('##### Casperswap constructor ####', chain, network);
    const config = CasperswapConfig.config;
    if (chain === 'casper') {
      this.chain = Casper.getInstance(network);
    } else {
      throw new Error('unsupported chain');
    }
    this._ttl = config.ttl;
    this._routerAbi = routerAbi.abi;
    this._gasLimitEstimate = config.gasLimitEstimate;
    this._router = config.casperswapRouterAddress(chain);
    console.error('##### Casperswap constructor ####', this._router);
  }

  public static getInstance(chain: string, network: string): Casperswap {
    if (Casperswap._instances === undefined) {
      Casperswap._instances = {};
    }
    if (!(chain + network in Casperswap._instances)) {
      Casperswap._instances[chain + network] = new Casperswap(chain, network);
    }

    return Casperswap._instances[chain + network];
  }

  /**
   * Given a token's address, return the connector's native representation of
   * the token.
   *
   * @param address Token address
   */
  public getTokenByAddress(address: string): any {
    return this.tokenList[address];
  }

  public async init() {
    if (!this.chain.ready()) {
      await this.chain.init();
    }
    for (const token of this.chain.storedTokenList) {
      this.tokenList[token.address] = token;
      // this.tokenList[token.address] = new Token(
      //   this.chainId,
      //   token.address,
      //   token.decimals,
      //   token.symbol,
      //   token.name
      // );
    }
    this._ready = true;
  }

  public ready(): boolean {
    return this._ready;
  }

  /**
   * Router address.
   */
  public get router(): string {
    return this._router;
  }

  /**
   * Router smart contract ABI.
   */
  public get routerAbi(): any {
    return this._routerAbi;
  }

  /**
   * Default gas limit for swap transactions.
   */
  public get gasLimitEstimate(): number {
    return this._gasLimitEstimate;
  }

  /**
   * Default time-to-live for swap transactions, in seconds.
   */
  public get ttl(): number {
    return this._ttl;
  }

  /**
   * Gets the allowed slippage percent from configuration.
   */
  getSlippagePercentage(): any {
    const allowedSlippage = CasperswapConfig.config.allowedSlippage;
    const nd = allowedSlippage.match(percentRegexp);
    if (nd) return '0.0';
    throw new Error(
      'Encountered a malformed percent string in the config for ALLOWED_SLIPPAGE.'
    );
  }

  /**
   * Fetches information about a pair and constructs a pair from the given two tokens.
   * This is to replace the Fetcher Class
   * @param baseToken  first token
   * @param quoteToken second token
   */

  async fetchData(baseToken: any, quoteToken: any): Promise<any> {
    /*
    const pairAddress = Pair.getAddress(baseToken, quoteToken);
    const contract = new Contract(
      pairAddress,
      IUniswapV2Pair.abi,
      this.chain.provider
    );
    const [reserves0, reserves1] = await contract.getReserves();
    const balances = baseToken.sortsBefore(quoteToken)
      ? [reserves0, reserves1]
      : [reserves1, reserves0];
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(baseToken, balances[0]),
      CurrencyAmount.fromRawAmount(quoteToken, balances[1])
    );
    return pair;
    */
    console.log(baseToken, quoteToken);
    return Promise.resolve();
  }

  /**
   * Given the amount of `baseToken` to put into a transaction, calculate the
   * amount of `quoteToken` that can be expected from the transaction.
   *
   * This is typically used for calculating token sell prices.
   *
   * @param baseToken Token input for the transaction
   * @param quoteToken Output from the transaction
   * @param amount Amount of `baseToken` to put into the transaction
   */

  async estimateSellTrade(
    baseToken: any,
    quoteToken: any,
    amount: BigNumber
  ): Promise<ExpectedTrade> {
    // const nativeTokenAmount: CurrencyAmount<Token> =
    //   CurrencyAmount.fromRawAmount(baseToken, amount.toString());

    // const nativeTokenAmount = BigNumber.from(amount.toString());

    logger.info(
      'estimateSellTrade: ' +
        baseToken +
        ' ' +
        quoteToken +
        ' ' +
        amount.toString()
    );

    logger.info(
      `Fetching pair data for ${baseToken.address}-${quoteToken.address}.`
    );

    // const pair: any = await this.fetchData(baseToken, quoteToken);

    // const trades: Trade<Token, Token, TradeType.EXACT_INPUT>[] =
    //   Trade.bestTradeExactIn([pair], nativeTokenAmount, quoteToken, {
    //     maxHops: 1,
    //   });
    const trades: any = [];
    if (!trades || trades.length === 0) {
      throw new UniswapishPriceError(
        `priceSwapIn: no trade pair found for ${baseToken} to ${quoteToken}.`
      );
    }
    logger.info(
      `Best trade for ${baseToken.address}-${quoteToken.address}: ` +
        `${trades[0].executionPrice.toFixed(6)}` +
        `${baseToken.name}.`
    );
    const expectedAmount = trades[0].minimumAmountOut(
      this.getSlippagePercentage()
    );

    return { trade: trades[0], expectedAmount };
  }
  async estimateBuyTrade(
    quoteToken: any,
    baseToken: any,
    amount: BigNumber
  ): Promise<ExpectedTrade> {
    // const nativeTokenAmount: CurrencyAmount<Token> =
    //   CurrencyAmount.fromRawAmount(baseToken, amount.toString());
    // const nativeTokenAmount = BigNumber.from(amount.toString());
    // const pair: any = await this.fetchData(quoteToken, baseToken);

    // const trades: Trade<Token, Token, TradeType.EXACT_OUTPUT>[] =
    //   Trade.bestTradeExactOut([pair], quoteToken, nativeTokenAmount, {
    //     maxHops: 1,
    //   });

    logger.info(
      'estimateBuyTrade: ' +
        baseToken +
        ' ' +
        quoteToken +
        ' ' +
        amount.toString()
    );

    const trades: any = [];
    if (!trades || trades.length === 0) {
      throw new UniswapishPriceError(
        `priceSwapOut: no trade pair found for ${quoteToken.address} to ${baseToken.address}.`
      );
    }
    logger.info(
      `Best trade for ${quoteToken.address}-${baseToken.address}: ` +
        `${trades[0].executionPrice.invert().toFixed(6)} ` +
        `${baseToken.name}.`
    );

    const expectedAmount = trades[0].maximumAmountIn(
      this.getSlippagePercentage()
    );
    return { trade: trades[0], expectedAmount };
  }

  /**
   * Given a wallet and a Uniswap trade, try to execute it on blockchain.
   *
   * @param wallet Wallet
   * @param trade Expected trade
   * @param gasPrice Base gas price, for pre-EIP1559 transactions
   * @param sushswapRouter Router smart contract address
   * @param ttl How long the swap is valid before expiry, in seconds
   * @param abi Router contract ABI
   * @param gasLimit Gas limit
   * @param nonce (Optional) EVM transaction nonce
   * @param maxFeePerGas (Optional) Maximum total fee per gas you want to pay
   * @param maxPriorityFeePerGas (Optional) Maximum tip per gas you want to pay
   */

  async executeTrade(
    wallet: any,
    trade: any,
    gasPrice: number,
    sushswapRouter: string,
    ttl: number,
    abi: any,
    gasLimit: number,
    nonce?: number,
    maxFeePerGas?: BigNumber,
    maxPriorityFeePerGas?: BigNumber
  ): Promise<any> {
    console.log(
      wallet,
      trade,
      gasPrice,
      sushswapRouter,
      ttl,
      abi,
      gasLimit,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas
    );
    /*
    const result: SwapParameters = Router.swapCallParameters(trade, {
      ttl,
      recipient: wallet.address,
      allowedSlippage: this.getSlippagePercentage(),
    });
    const contract: Contract = new Contract(sushswapRouter, abi, wallet);
    return this.chain.nonceManager.provideNonce(
      nonce,
      wallet.address,
      async (nextNonce) => {
        let tx: ContractTransaction;
        if (maxFeePerGas !== undefined || maxPriorityFeePerGas !== undefined) {
          tx = await contract[result.methodName](...result.args, {
            gasLimit: gasLimit.toFixed(0),
            value: result.value,
            nonce: nextNonce,
            maxFeePerGas,
            maxPriorityFeePerGas,
          });
        } else {
          tx = await contract[result.methodName](...result.args, {
            gasPrice: (gasPrice * 1e9).toFixed(0),
            gasLimit: gasLimit.toFixed(0),
            value: result.value,
            nonce: nextNonce,
          });
        }

        logger.info(JSON.stringify(tx));
        return tx;
      }
    );

     */
    return Promise.resolve();
  }
}
