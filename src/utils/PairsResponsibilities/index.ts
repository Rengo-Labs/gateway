import { getPairData } from '../api/ApolloQueries';
import { convertBigNumberToUIString } from '../pairFinder';
import BigNumber from 'bignumber.js';

import { pairFinder } from '../pairFinder';
import { PairData } from '../pathFinder';
import { APIClient } from '../api/APIClient';

export interface PairTotalReserves {
  totalReserve0: BigNumber.Value;
  totalReserve1: BigNumber.Value;
}

const PairsResponsibilities = (
  pairs: PairData[],
  tokens: Record<string, any>,
  network: string
) => {
  async function loadPairsUSD(
    pairTotalReserves: Record<string, PairTotalReserves>,
    tokenPairs: PairData[]
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const instance = pairFinder(tokenPairs, tokens);
      for (const p of tokenPairs) {
        const price0USD = instance
          .findUSDRateBySymbol(p.token0Symbol, pairTotalReserves)
          .toString();
        const price1USD = instance
          .findUSDRateBySymbol(p.token1Symbol, pairTotalReserves)
          .toString();

        const liquidityUSD = new BigNumber(p.reserve0)
          .times(price0USD)
          .plus(new BigNumber(p.reserve1).times(price1USD))
          .toString();
        const totalLiquidityUSD = new BigNumber(p.totalReserve0)
          .times(price0USD)
          .plus(new BigNumber(p.totalReserve1).times(price1USD))
          .toString();

        p.token0Price = price0USD;
        p.token1Price = price1USD;
        p.liquidityUSD = liquidityUSD;
        p.totalLiquidityUSD = totalLiquidityUSD;
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.error('loadPairsUSD - PairsResponsibility', err.message);
    }
  }

  const loadLatestPairsData = async (pairs: any[]) => {
    const infoResultMap: Record<string, any> = {};
    try {
      const infoResults = await getPairData(
        pairs.map((pl) => pl.packageHash.substr(5))
      );
      infoResults.map((pl) => (infoResultMap[`hash-${pl.id}`] = pl));

      return infoResultMap;
    } catch (e) {
      console.log(`graphql error - PairsResponsibility: ${e}`);
      return [];
    }
  };

  const getGeneralPairData = async (
    pairsList: any[],
    pairsMap: Record<string, any>
  ) => {
    //console.log('getGeneralPairData from PairsResponsibility')
    const results = await Promise.all(
      pairsList.map(async (pl) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pairDataResponse = await APIClient.instance.getPairData(
          pl.contractHash
        );

        const token0Decimals = tokens[pl.token0Symbol].decimals;
        const token1Decimals = tokens[pl.token1Symbol].decimals;
        const reserve0 = convertBigNumberToUIString(
          new BigNumber(pairDataResponse.reserve0),
          token0Decimals
        );
        const reserve1 = convertBigNumberToUIString(
          new BigNumber(pairDataResponse.reserve1),
          token1Decimals
        );

        const infoResult = pairsMap[pl.packageHash] ?? {
          oneWeekVoluemUSD: 0,
          oneDayVoluemUSD: 0,
          reserveUSD: 0,
        };

        return {
          name: pl.name,
          orderedName: pl.orderedName,
          totalReserve0: reserve0,
          totalReserve1: reserve1,
          volume7d: new BigNumber(infoResult.oneWeekVolumeUSD)
            .div(10 ** pl.decimals)
            .toFixed(2),
          volume1d: new BigNumber(infoResult.oneDayVolumeUSD)
            .div(10 ** pl.decimals)
            .toFixed(2),
          totalSupply: convertBigNumberToUIString(
            new BigNumber(pairDataResponse.totalSupply),
            pl.decimals
          ),
          totalLiquidityUSD: convertBigNumberToUIString(
            new BigNumber(infoResult ? infoResult.reserveUSD : 0),
            pl.decimals
          ),
        };
      })
    );

    return results;
  };

  const updateGeneralPairData = async (
    results: any[],
    pairsList: Record<string, any>
  ) => {
    //console.log('updateGeneralPairData from PairsResponsibility')
    const pairTotalReserves: Record<string, PairTotalReserves> = {};
    for (const pl of results) {
      const item = pairsList[pl.name];
      item.volume1d = pl.volume1d;
      item.volume7d = pl.volume7d;
      item.totalReserve0 = pl.totalReserve0;
      item.totalReserve1 = pl.totalReserve1;
      item.totalSupply = pl.totalSupply;
      item.totalLiquidityUSD = pl.totalLiquidityUSD;

      pairTotalReserves[pl.orderedName] = {
        totalReserve0: pl.totalReserve0,
        totalReserve1: pl.totalReserve1,
      };
    }

    //console.log('pairTotalReserves from PairsResponsibility', pairTotalReserves)

    return pairTotalReserves;
  };

  const loadPairs = async (): Promise<Record<string, PairTotalReserves>> => {
    try {
      const pairsList = Object.values(pairs);
      const infoResultMap = await loadLatestPairsData(pairsList);
      const loadPairBalances = await getGeneralPairData(
        pairsList,
        infoResultMap
      );

      console.log('loadPair', loadPairBalances);
      return await updateGeneralPairData(loadPairBalances, pairsList);
    } catch (err) {
      console.error("Error", err);
      return {};
    }
  };

  const loadPairsBalanceUSD = async (
    pairTotalReserves: Record<string, any>,
    tokenPairs: any[]
  ) => {
    await loadPairsUSD(pairTotalReserves, tokenPairs);
  };

  const pairsToMap = () => {
    const pairsList = Object.values(pairs);
    const pairTotalReserves: Record<string, PairTotalReserves> = {};
    for (const pl of pairsList) {
      pairTotalReserves[pl.name] = {
        totalReserve0: pl.totalReserve0,
        totalReserve1: pl.totalReserve1,
      };
    }
    return pairTotalReserves;
  };

  const getList = (): PairData[] => {
    return Object.values(pairs);
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const findReservesBySymbols = (symbolA, symbolB, orderedPairState) =>
    pairFinder(pairs, tokens, network).findReservesBySymbols(
      symbolA,
      symbolB,
      orderedPairState
    );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const findUSDRateBySymbol = (symbol) =>
    pairFinder(pairs, tokens, network).findUSDRateBySymbol(
      symbol,
      pairsToMap()
    );

  const calculateUSDtokens = (
    token0Price: string,
    token1Price: string,
    amount0: string | number,
    amount1: string | number,
    isAorB: boolean
  ): string[] => {
    const priceA = new BigNumber(amount0)
      .times(isAorB ? token0Price : token1Price)
      .toFixed(2);
    const priceB = new BigNumber(amount1)
      .times(isAorB ? token1Price : token0Price)
      .toFixed(2);

    return [priceA, priceB];
  };

  return {
    loadPairs,
    loadPairsBalanceUSD,
    getList,
    findReservesBySymbols,
    calculateUSDtokens,
    findUSDRateBySymbol,
  };
};

export default PairsResponsibilities;
