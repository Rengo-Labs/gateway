import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const ONE_BILLION_E = 9;

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

export const fixAmountOfZeros = (number: BigNumber, decimals: number) => {
  let divisor = ONE_BILLION_E;
  if (ONE_BILLION_E > decimals) {
    divisor = ONE_BILLION_E + Math.abs(decimals - ONE_BILLION_E);
  } else {
    divisor = ONE_BILLION_E - Math.abs(decimals - ONE_BILLION_E);
  }
  const result = number.div(10 ** divisor);
  return result.toFixed(ONE_BILLION_E);
};

export const convertToUSDCurrency = (amount: number) =>
  amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

/**
 *
 * @param ms
 * @returns
 */
export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatNaN = (value: string | number) => {
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsedValue) ? 0 : parsedValue;
};

export const shortenString = (value: string, start: number, end?: number) => {
  const defaultEnd = end || start;
  const shortString = `${value.substring(0, start)}.....${value.substring(
    value.length - defaultEnd
  )}`;

  return shortString;
};

export const dateConverter = (date: string) => {
  const dateValue = dayjs(date);
  const now = dayjs();
  return dateValue.from(now);
};

export const getIPfromUser = async () => {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
};
