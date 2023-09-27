import {
  ApolloClient,
  gql,
  HttpLink,
  DefaultOptions,
  InMemoryCache,
} from '@apollo/client';
import { INFO_SWAP_URL, INFO_BLOCK_URL } from '../constants';
import * as dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Pair, PairByIdAndBlock } from './types';

// format libraries
dayjs.extend(utc);

interface BasicData {
  token0?: {
    id: string;
    name: string;
    symbol: string;
  };
  token1?: {
    id: string;
    name: string;
    symbol: string;
  };
}

// Override data return from graph - usually because proxy token has changed
// names since entity was created in subgraph
// keys are lowercase token addresses <--------
const TOKEN_OVERRIDES: { [address: string]: { name: string; symbol: string } } =
  {
    c6649901da894d4ac2c77c0ae217190f79cabc8c0c91788ee997f670b8bdd05e: {
      name: 'Casper (Wrapped)',
      symbol: 'CSPR',
    },
    '0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a': {
      name: 'Casper (Wrapped)',
      symbol: 'CSPR',
    },
  };
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

const v2client = new ApolloClient({
  link: new HttpLink({
    uri: INFO_SWAP_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
  //shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: INFO_BLOCK_URL,
  }),
  cache: new InMemoryCache(),
  //shouldBatch: true,
});

const PairFields = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
    createdAtBlockNumber
  }
`;

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
  }
`;

export const PAIRS_BULK = gql`
  ${PairFields}
  query allpairs($allPairs: [String]!) {
    allpairs(first: 500, id: $allPairs) {
      ...PairFields
    }
  }
`;

export const PAIRS_HISTORICAL_BULK = (block: number, pairs: any) => {
  let pairsString = `[`;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pairs.map((pair) => {
    return (pairsString += `"${pair}",`);
  });
  pairsString += ']';

  const queryString = `
   query pairsByIds {
     pairsByIdsandBlock(${
       block
         ? `first: 200, ids: ${pairsString}, blockNumber:"${block}"`
         : `first: 200, ids: ${pairsString}`
     }) {
       id
       reserveUSD
       trackedReserveETH
       volumeUSD
       untrackedVolumeUSD
     }
   }
   `;
  return gql(queryString);
};

export const GET_BLOCKS = (timestamps: number[]) => {
  let queryString = 'query getBlockBetweenTimestampsDesc {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:getBlockBetweenTimestampsDesc(timestampFrom: "${new Date(
      timestamp * 1000
    ).toISOString()}", timestampTo: "${new Date(
      (timestamp + 600) * 1000
    ).toISOString()}") 
    {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};

export const PAIR_DATA_BY_ID_AND_BLOCK = (
  pairAddress: string,
  block: number
) => {
  const pairString = `"${pairAddress}"`;
  const queryString = `
  ${PairFields}
  query pairbyIdandBlock {
    pairbyIdandBlock(id: ${pairString}, blockNumber : "${block}") {
      ...PairFields
    }
  }
  `;
  return gql(queryString);
};

export const ETH_PRICE = (block?: number) => {
  const queryString = block
    ? ` query bundle {
      bundleByIdandBlock(id: "1", blockNumber : "${block}") {
        id
        ethPrice
      }
    }
  `
    : ` query bundle {
    bundle(id: "1") {
      id
      ethPrice
    }
  }
`;
  return gql(queryString);
};
export const TOKEN_DATA = (tokenHash: string) => {
  const queryString = `
    ${TokenFields}
    query {
      tokenbyId(id:"${tokenHash}") {
        ...TokenFields
      }
      pairs0: pairsbytoken0(first: 50, token0: "${tokenHash}"){
        id
      }
      pairs1: pairsbytoken1(first: 50, token1: "${tokenHash}"){
        id
      }
    }
  `;
  return gql(queryString);
};

export const TOKEN_DATA_BY_BLOCK = (tokenHash: string, block: number) => {
  const queryString = `
    ${TokenFields}
    query {
      tokenbyIdandBlock(${
        block
          ? `id:"${tokenHash}", blockNumber : "${block}"`
          : `id:"${tokenHash}"`
      }) {
        ...TokenFields
      }
      pairs0: pairsbytoken0(first: 50, token0: "${tokenHash}"){
        id
      }
      pairs1: pairsbytoken1(first: 50, token1: "${tokenHash}"){
        id
      }
    }
  `;
  return gql(queryString);
};

export const PRICES_BY_BLOCK = (tokenAddress: string, blocks: any[]) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:tokenbyIdandBlock(id: "${tokenAddress}", blockNumber : "${block.number}") {
        derivedETH
      }
    `
  );
  queryString += ',';
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundleByIdandBlock(id:"1",blockNumber: "${block.number}") {
        ethPrice
      }
    `
  );

  queryString += '}';

  return gql(queryString);
};

export const GET_BLOCK = (timestampFrom: string, timestampTo: string) => {
  const queryString = `
  query getBlockBetweenTimestampsAsc {
    getBlockBetweenTimestampsAsc(timestampFrom : "${timestampFrom}", timestampTo : "${timestampTo}") {
      id
      number
      timestamp
    }
  }
  `;
  return gql(queryString);
};

export const TOKEN_CHART = gql`
  query tokendaydatas($tokenAddr: String!, $skip: Int!) {
    tokendaydatas(first: 1000, skip: $skip, token: $tokenAddr) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

// PAIR chart to show
export const PAIR_CHART = gql`
  query pairdaydatasbypairAddress($pairAddress: String!, $skip: Int!) {
    pairdaydatasbypairAddress(
      first: 1000
      skip: $skip
      pairAddress: $pairAddress
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

export const GLOBAL_CHART = gql`
  query uniswapdaydatasbydate($startTime: String!, $skip: Int!) {
    uniswapdaydatasbydate(first: 1000, skip: $skip, date: $startTime) {
      id
      date
      totalVolumeUSD
      dailyVolumeUSD
      dailyVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`;

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs.utc();
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
  const t3 = utcCurrentTime.subtract(3, 'day').startOf('minute').unix();
  const t4 = utcCurrentTime.subtract(4, 'day').startOf('minute').unix();
  const t5 = utcCurrentTime.subtract(5, 'day').startOf('minute').unix();
  const t6 = utcCurrentTime.subtract(6, 'day').startOf('minute').unix();
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix();
  return [t1, t2, t3, t4, t5, t6, tWeek];
}

export async function splitQuery(
  query: any,
  localClient: any,
  vars: any,
  list: any[],
  skipCount = 100
) {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    const sliced = list.slice(skip, end);

    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first',
    });

    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }
  return fetchedData;
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(
  timestamps: number[],
  skipCount = 500
) {
  if (timestamps?.length === 0) {
    return [];
  }

  const fetchedData = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount
  );

  const blocks = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (fetchedData[t] != null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const data = fetchedData[t];
        blocks.push({
          timestamp: t.split('t')[1],
          number: data['number'],
        });
      } else {
        blocks.push({
          timestamp: 0,
          number: 0,
        });
      }
    }
  }
  return blocks;
}

/**
 * gets the amount difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (
  valueNow: string,
  value24HoursAgo: string,
  value48HoursAgo: string
) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  const previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (parseFloat((currentChange - previousChange) as any) /
      parseFloat(previousChange as any)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow: string, value24HoursAgo: string) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

// override tokens with incorrect symbol or names
export function updateNameData(data: BasicData): BasicData | undefined {
  if (
    data?.token0?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token0.id)
  ) {
    data.token0 = Object.assign({}, data.token0);
    data.token0.name = TOKEN_OVERRIDES[data.token0.id].name;
    data.token0.symbol = TOKEN_OVERRIDES[data.token0.id].symbol;
  }

  if (
    data?.token1?.id &&
    Object.keys(TOKEN_OVERRIDES).includes(data.token1.id)
  ) {
    data.token1 = Object.assign({}, data.token1);
    data.token1.name = TOKEN_OVERRIDES[data.token1.id].name;
    data.token1.symbol = TOKEN_OVERRIDES[data.token1.id].symbol;
  }

  return data;
}

function parseData(
  data: any,
  oneDayData: Pair,
  twoDayData: Pair,
  oneWeekData: Pair,
  ethPrice: any,
  oneDayBlock: any
) {
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : '0',
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : '0'
  );

  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? oneDayData?.untrackedVolumeUSD : '0',
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : '0'
  );

  const oneWeekVolumeUSD = parseFloat(
    oneWeekData
      ? (
          parseFloat(data?.volumeUSD) - parseFloat(oneWeekData?.volumeUSD)
        ).toString()
      : data.volumeUSD
  );

  const oneWeekVolumeUntracked = parseFloat(
    oneWeekData
      ? (
          parseFloat(data?.untrackedVolumeUSD) -
          parseFloat(oneWeekData?.untrackedVolumeUSD)
        ).toString()
      : data.untrackedVolumeUSD
  );

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD as any);
  data.oneWeekVolumeUSD = oneWeekVolumeUSD;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquidity properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice;
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD
  );

  // format if pair hasn't existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD);
  }

  /*
  if (TRACKED_OVERRIDES.includes(pairAddress)) {
    data.oneDayVolumeUSD = oneDayVolumeUntracked
    data.oneWeekVolumeUSD = oneWeekVolumeUntracked
    data.volumeChangeUSD = volumeChangeUntracked
    data.trackedReserveUSD = data.reserveUSD
  }
*/
  // format incorrect names
  updateNameData(data);

  return data;
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp: number) {
  const timestampFrom = new Date(timestamp * 1000).toISOString();
  const timestampTo = new Date((timestamp + 600) * 1000).toISOString();

  const result = await blockClient.query({
    query: GET_BLOCK(timestampFrom.toString(), timestampTo.toString()),
    fetchPolicy: 'cache-first',
  });

  return result?.data?.getBlockBetweenTimestampsAsc?.number;
}

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
const getEthPrice = async () => {
  const utcCurrentTime = dayjs.utc();
  const utcOneDayBack = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix();

  let ethPrice = 0;
  let ethPriceOneDay = 0;
  let priceChangeETH = 0;

  try {
    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
    const result = await v2client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first',
    });
    const resultOneDay = await v2client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first',
    });
    const currentPrice = result?.data?.bundle?.ethPrice;
    const oneDayBackPrice = resultOneDay?.data?.bundleByIdandBlock?.ethPrice; //null
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice);
    ethPrice = currentPrice;
    ethPriceOneDay = oneDayBackPrice;
    // ethPrice = 1
    // ethPriceOneDay = 1
    // priceChangeETH = 1
  } catch (e) {
    console.log(e);
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH];
};

export async function getPercentChangeByBlocks(
  pricesByBlocks: any,
  timestamps: any[]
) {
  const percents = [];
  for (let i = 0; i < timestamps.length - 1; i++) {
    const nowPrice =
      parseFloat(pricesByBlocks.data[`t${timestamps[i]}`].derivedETH) *
      parseFloat(pricesByBlocks.data[`b${timestamps[i]}`].ethPrice);
    const oneDayPrice =
      parseFloat(pricesByBlocks.data[`t${timestamps[i + 1]}`].derivedETH) *
      parseFloat(pricesByBlocks.data[`b${timestamps[i + 1]}`].ethPrice);
    const percent = getPercentChange(
      nowPrice.toString(),
      oneDayPrice.toString()
    );
    percents.push({ nowPrice, oneDayPrice, percent });
  }
  return percents;
}

export async function getPercentChangeByToken(tokenPackageHash: string) {
  try {
    const timestamps = getTimestampsForChanges();
    const blocks = await getBlocksFromTimestamps([...timestamps]);

    const pricesByBlocks = await v2client.query({
      query: PRICES_BY_BLOCK(tokenPackageHash.slice(5), blocks),
      fetchPolicy: 'no-cache',
    });

    return await getPercentChangeByBlocks(pricesByBlocks, timestamps);
  } catch (e) {
    console.log(e);
    return [{ nowPrice: 0, oneDayPrice: 0, percent: 0 }];
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function getBulkPairData(pairList: string[], ethPrice: number[]) {
  const [t1, t2, tWeek] = getTimestampsForChanges();
  const [{ number: b1 }, { number: b2 }, { number: bWeek }] =
    await getBlocksFromTimestamps([t1, t2, tWeek]);

  try {
    const current = await v2client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList,
      },
      fetchPolicy: 'network-only',
    });

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async (block) => {
        const result = await v2client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'network-only',
        });

        //console.log('PAIRS_HISTORICAL_BULK', result)
        return result;
      })
    );
    const oneDayData = oneDayResult?.data?.pairsByIdsandBlock?.reduce(
      (obj: PairByIdAndBlock[], cur: PairByIdAndBlock) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    const twoDayData = twoDayResult?.data?.pairsByIdsandBlock?.reduce(
      (obj: PairByIdAndBlock[], cur: PairByIdAndBlock) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    const oneWeekData = oneWeekResult?.data?.pairsByIdsandBlock?.reduce(
      (obj: PairByIdAndBlock[], cur: PairByIdAndBlock) => {
        return { ...obj, [cur.id]: cur };
      },
      {}
    );

    const pairData = await Promise.all(
      current &&
        current.data.allpairs.map(async (pair: Pair) => {
          let data = Object.assign({}, pair);
          let oneDayHistory = oneDayData?.[pair.id];

          if (!oneDayHistory) {
            const newData = await v2client.query({
              query: PAIR_DATA_BY_ID_AND_BLOCK(pair.id, b1),
              fetchPolicy: 'cache-first',
            });
            //console.warn({ newData });
            oneDayHistory = newData.data.pairbyIdandBlock[0];
          }
          let twoDayHistory = twoDayData?.[pair.id];
          if (!twoDayHistory) {
            const newData = await v2client.query({
              query: PAIR_DATA_BY_ID_AND_BLOCK(pair.id, b2),
              fetchPolicy: 'cache-first',
            });
            twoDayHistory = newData.data.pairbyIdandBlock[0];
          }
          let oneWeekHistory = oneWeekData?.[pair.id];
          if (!oneWeekHistory) {
            const newData = await v2client.query({
              query: PAIR_DATA_BY_ID_AND_BLOCK(pair.id, bWeek),
              fetchPolicy: 'cache-first',
            });
            oneWeekHistory = newData.data.pairbyIdandBlock[0];
          }
          data = parseData(
            Object.assign({}, data),
            oneDayHistory,
            twoDayHistory,
            oneWeekHistory,
            ethPrice,
            b1
          );
          return data;
        })
    );
    return pairData;
  } catch (e) {
    console.error(e);
  }
}

const getPairDataByDays = async (pairPackageHash: string, skip: any) => {
  try {
    const result = await v2client.query({
      query: PAIR_CHART,
      variables: {
        pairAddress: pairPackageHash,
        skip,
      },
      fetchPolicy: 'cache-first',
    });
    console.log('PAIR_CHART', result);
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Get the historical token prices by passing the token package hash
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
const getTokenDataByDays = async (
  tokenPackageHash: string,
  skip = 0
): Promise<any> => {
  try {
    const result = await v2client.query({
      query: TOKEN_CHART,
      variables: {
        tokenAddr: tokenPackageHash,
        skip,
      },
      fetchPolicy: 'cache-first',
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTokenChartData = async (tokenPackageHash: string) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  const utcStartTime = utcEndTime.subtract(1, 'year');
  const startTime = utcStartTime.startOf('minute').unix() - 1;

  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await getTokenDataByDays(tokenPackageHash.slice(5), skip);
      if (result.data.tokendaydatas.length < 1000) {
        allFound = true;
      }
      for (let index = 0; index < result.data.tokendaydatas.length; index++) {
        const el = result.data.tokendaydatas[index];
        const obj = {
          date: el.date,
          dayString: el.date,
          dailyVolumeUSD: el.dailyVolumeUSD,
          dailyVolumeUSDValue: el.dailyVolumeUSD / 10 ** 9,
          priceUSD: el.priceUSD,
          totalLiquidityUSD: el.totalLiquidityUSD,
          totalLiquidityUSDValue: el.totalLiquidityUSD / 10 ** 9,
          totalLiquidityTokenValue: el.totalLiquidityToken / 10 ** 9,
        };
        data.push(obj);
      }

      skip += 1000;
    }
    const dayIndexSet = new Set();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const dayIndexArray: any[] = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
      dayData.dailyVolumeUSDValue = parseFloat(dayData.dailyVolumeUSDValue);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestLiquidityUSDValue =
      data[0] && data[0].totalLiquidityUSD / 10 ** 9;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    //let latestPairDatas = data[0] && data[0].mostLiquidPairs
    let index = 1;
    while (timestamp < utcEndTime.startOf('minute').unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      const currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          dailyVolumeUSDValue: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          totalLiquidityUSDValue: latestLiquidityUSDValue,
          //mostLiquidPairs: latestPairDatas,
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        latestLiquidityUSDValue =
          parseFloat(dayIndexArray[index].totalLiquidityUSD) / 10 ** 9;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        latestPriceUSD = dayIndexArray[index].priceUSD;
        //latestPairDatas = dayIndexArray[index].mostLiquidPairs
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.error(e);
  }
  return data;
};

const getPairChartData = async (pairPackageHash: string) => {
  let data: any[] = [];
  const utcEndTime = dayjs.utc();
  const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute');
  const startTime = utcStartTime.unix() - 1;

  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await getPairDataByDays(pairPackageHash, skip);
      for (
        let index = 0;
        index < result?.data.pairdaydatasbypairAddress.length;
        index++
      ) {
        const el = result?.data.pairdaydatasbypairAddress[index];
        const obj = {
          date: el.date,
          dayString: el.date,
          dailyVolumeUSD: el.dailyVolumeUSD,
          reserveUSD: el.reserveUSD,
          reserveUSDValue: el.reserveUSD / 10 ** 9,
          dailyVolumeUSDValue: el.dailyVolumeUSD / 10 ** 9,
        };
        data.push(obj);
      }

      skip += 1000;
      if (result?.data.pairdaydatasbypairAddress.length < 1000) {
        allFound = true;
      }
      // console.log("data1", data1);
    }

    const dayIndexSet = new Set();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const dayIndexArray = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // console.log("dayData.reserveUSD", dayData);
      // console.log("data[i]", data[i]);
      // add the day index to the set of days
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
      dayData.dailyVolumeUSDValue = parseFloat(dayData.dailyVolumeUSDValue);
      dayData.reserveUSD = parseFloat(dayData.reserveUSD);
      dayData.reserveUSDValue = parseFloat(dayData.reserveUSDValue);
    });

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime;
      let latestLiquidityUSD = data[0].reserveUSD;
      let latestLiquidityUSDValue = data[0].reserveUSD / 10 ** 9;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            dailyVolumeUSDValue: 0,
            reserveUSD: latestLiquidityUSD,
            reserveUSDValue: latestLiquidityUSDValue,
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          latestLiquidityUSD = dayIndexArray[index].reserveUSD;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          latestLiquidityUSDValue = dayIndexArray[index].reserveUSD / 10 ** 9;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.error('getPairChartData', e);
  }

  return data;
};

const getProfit = (tokenData: any[], days: number) => {
  if (tokenData.length > days) {
    return (tokenData[0].priceUSD / tokenData[days].priceUSD - 1) * 100;
  }
  return 0.0;
};

export const getPairData = async (pairList: string[] = []): Promise<Pair[]> => {
  try {
    const ethPrice = await getEthPrice();
    const result = await getBulkPairData(pairList, ethPrice);

    return result == undefined ? [] : result;
  } catch (e) {
    console.error('getPairData', e);
    return [];
  }
};

export interface TokenProfit {
  yesterday: number;
  sevenDays: number;
  fifteenDays: number;
  thirtyDays: number;
}

export const getBalanceProfitByContractHash = async (
  packageHash: string
): Promise<TokenProfit> => {
  try {
    const profit = await getTokenDataByDays(packageHash.slice(5));
    return {
      yesterday: getProfit(profit.data.tokendaydatas, 1),
      sevenDays: getProfit(profit.data.tokendaydatas, 7),
      fifteenDays: getProfit(profit.data.tokendaydatas, 15),
      thirtyDays: getProfit(profit.data.tokendaydatas, 30),
    } as TokenProfit;
  } catch (e) {
    console.error(e);
    return {
      yesterday: 0.0,
      sevenDays: 0.0,
      fifteenDays: 0.0,
      thirtyDays: 0.0,
    } as TokenProfit;
  }
};

export const findPairChartData = async (pairPackageHash: string) => {
  const result = await getPairChartData(pairPackageHash);
  return result;
};
