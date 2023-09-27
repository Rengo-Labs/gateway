import BigNumber from 'bignumber.js';

import {
  getPath,
  PairData,
  PairReserves,
  PairTotalReserves,
} from '../pathFinder';

export const convertBigNumberToUIString = (
  amount: BigNumber,
  decimals: number
): string => amount.div(10 ** decimals).toString();
export const convertUIStringToBigNumber = (
  amount: BigNumber.Value,
  decimals: number
): BigNumber => new BigNumber(amount).times(10 ** decimals);
export const convertAllFormatsToUIFixedString = (
  amount: BigNumber.Value,
  fixed = 6
): string => new BigNumber(amount).toFixed(fixed);

export const pairFinder = (
  pairs: PairData[],
  tokens: Record<string, any>,
  network: string
) => {
  const USDT_SYMBOL = 'testnet' === network ? 'USDT' : 'dUSDT';
  const USDC_SYMBOL = 'testnet' === network ? 'USDC' : 'dUSDC';

  const orderedPairState = (): Record<string, PairTotalReserves> => {
    const orderedPairs: Record<string, PairTotalReserves> = {};

    return orderedPairs;
  };

  /**
   * findReservesBySymbols search for pair data by the symbol pair
   *
   * @param tokenSymbol token symbol string
   *
   * @returns usd conversion rate
   */
  const findUSDRateBySymbol = (
    tokenSymbol: string,
    pairTotalReserves: Record<string, PairTotalReserves>
  ): BigNumber => {
    let t = tokenSymbol;
    if (t === 'CSPR') {
      t = 'WCSPR';
    }

    if (t === USDC_SYMBOL) {
      return new BigNumber(1);
    }

    if (t === USDT_SYMBOL) {
      return new BigNumber(1);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ratesUSDC: PairReserves = findReservesBySymbols(
      t,
      USDC_SYMBOL,
      pairTotalReserves
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ratesUSDT: PairReserves = findReservesBySymbols(
      t,
      USDT_SYMBOL,
      pairTotalReserves
    );

    const cr0 = new BigNumber(ratesUSDC.reserve0).div(
      new BigNumber(10).pow(ratesUSDC.decimals0)
    );
    const cr1 = new BigNumber(ratesUSDC.reserve1).div(
      new BigNumber(10).pow(ratesUSDC.decimals1)
    );
    const tr0 = new BigNumber(ratesUSDT.reserve0).div(
      new BigNumber(10).pow(ratesUSDT.decimals0)
    );
    const tr1 = new BigNumber(ratesUSDT.reserve1).div(
      new BigNumber(10).pow(ratesUSDT.decimals1)
    );

    if (
      ratesUSDC.reserve0.toString() === '0' ||
      ratesUSDT.reserve0.toString() === '0'
    ) {
      return new BigNumber(0);
    }

    return new BigNumber(cr1.div(cr0)).plus(tr1.div(tr0)).div(2);
  };

  /**
   * findReservesBySymbols search for pair data by the symbol pair
   *
   * @param tokenASymbol first token symbol string
   * @param tokenBSymbol second token symbol string
   *
   * @returns pair reserve data
   */
  const findReservesBySymbols = (
    tokenASymbol: string,
    tokenBSymbol: string,
    overrideReserves: Record<string, PairTotalReserves> = {}
  ): PairReserves | undefined => {
    let tA = tokenASymbol;
    let tB = tokenBSymbol;
    if (tA === 'CSPR') {
      tA = 'WCSPR';
    }
    if (tB === 'CSPR') {
      tB = 'WCSPR';
    }

    const tADecimals = tokens[tokenASymbol]?.decimals || 9;
    const tBDecimals = tokens[tokenBSymbol]?.decimals || 9;

    let lookUp = `${tA}-${tB}`;

    // do a simple look up
    let pairData = overrideReserves[lookUp] ?? orderedPairState()[lookUp];
    if (pairData) {
      return {
        reserve0: convertUIStringToBigNumber(
          pairData.totalReserve0,
          tADecimals
        ),
        reserve1: convertUIStringToBigNumber(
          pairData.totalReserve1,
          tBDecimals
        ),
        decimals0: tADecimals,
        decimals1: tBDecimals,
      };
    }
    // do different simple look up
    lookUp = `${tB}-${tA}`;
    pairData = overrideReserves[lookUp] ?? orderedPairState()[lookUp];
    if (pairData) {
      return {
        reserve0: convertUIStringToBigNumber(
          pairData.totalReserve1,
          tADecimals
        ),
        reserve1: convertUIStringToBigNumber(
          pairData.totalReserve0,
          tBDecimals
        ),
        decimals0: tADecimals,
        decimals1: tBDecimals,
      };
    }

    // use pathfinder for multi-pool
    const path = getPath(tA, tB, Object.values(tokens), pairs);

    if (!path || !path.length) {
      return {
        reserve0: new BigNumber(0),
        reserve1: new BigNumber(0),
        decimals0: new BigNumber(0),
        decimals1: new BigNumber(0),
      };
    }

    let first = true;
    let firstReserve0 = new BigNumber(1);
    let reserve0 = new BigNumber(1);
    let reserve1 = new BigNumber(1);
    for (let i = 1; i < path.length; i++) {
      const pair = overrideReserves[path[i].label.name] ?? path[i].label;
      if (path[i - 1].id == tokenASymbol) {
        const token0 = tokens[tokenASymbol];
        const token1 = tokens[tokenBSymbol];

        if (!token0 || !token1) {
          continue;
        }

        reserve0 = reserve0.times(
          convertUIStringToBigNumber(pair.totalReserve0, token0.decimals)
        );
        reserve1 = reserve1.times(
          convertUIStringToBigNumber(pair.totalReserve1, token1.decimals)
        );
      } else {
        const token0 = tokens[tokenASymbol];
        const token1 = tokens[tokenBSymbol];

        if (!token0 || !token1) {
          continue;
        }

        reserve0 = reserve0.times(
          convertUIStringToBigNumber(pair.totalReserve1, token1.decimals)
        );
        reserve1 = reserve1.times(
          convertUIStringToBigNumber(pair.totalReserve0, token0.decimals)
        );
      }

      if (first) {
        firstReserve0 = reserve0;
        first = false;
      }
    }

    const ratio = firstReserve0.div(reserve0);

    return {
      reserve0: convertUIStringToBigNumber(firstReserve0, tADecimals),
      reserve1: convertUIStringToBigNumber(reserve1.times(ratio), tBDecimals),
      decimals0: tADecimals,
      decimals1: tBDecimals,
    };
  };

  return {
    orderedPairState,
    findUSDRateBySymbol,
    findReservesBySymbols,
  };
};
