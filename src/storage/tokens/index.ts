import Redis from 'ioredis';

export const loadTokens = async (client: Redis) =>
  Promise.all([
    client.set(
      'token-contract:CSPR',
      JSON.stringify({
        name: 'Casper',
        chainId: 1,
        symbol: 'CSPR',
        symbolPair: 'WCSPR',
        decimals: 9,
        contractHash: '',
        packageHash: '',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:CST',
      JSON.stringify({
        name: 'CasperSwap',
        chainId: 1,
        symbol: 'CST',
        symbolPair: 'CST',
        decimals: 9,
        contractHash:
          'hash-848426b2cb8be4ef6dca0d76e0202ecaae4054739f0c13f512c0b07e549ffd10',
        packageHash:
          'hash-995947f349c23a1812f6c7702e75eb95afabdb5f389f150e4ddb91c9de6225f0',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:WBTC',
      JSON.stringify({
        name: 'Wrapped Bitcoin',
        chainId: 1,
        symbol: 'WBTC',
        symbolPair: 'WBTC',
        decimals: 9,
        contractHash:
          'hash-71afe14308465f7eb7f49463df96ba52cf2da8e1deeb64a1d0978af9170e52ce',
        packageHash:
          'hash-883238e99639bc7f5f7858398d0df94138c8ad89f76bdef7fac5fdd3df7f033a',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:WETH',
      JSON.stringify({
        name: 'Wrapped Ether',
        chainId: 1,
        symbol: 'WETH',
        symbolPair: 'WETH',
        decimals: 9,
        contractHash:
          'hash-906e222218c54ff108d8b88d6b7f4fdcb4b5c41428463166f9ac2abf25cc4178',
        packageHash:
          'hash-28eed3da2b123334c7913d84c4aea0ed426fd268d29410cb12c6bc8a453183f6',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:WCSPR',
      JSON.stringify({
        name: 'Wrapped Casper',
        chainId: 1,
        symbol: 'WCSPR',
        symbolPair: 'WCSPR',
        decimals: 9,
        contractHash:
          'hash-99baafab995cab68ca622edcb29fee7b83e1245ac0a3218444e996f561cba8f9',
        packageHash:
          'hash-0885c63f5f25ec5b6f3b57338fae5849aea5f1a2c96fc61411f2bfc5e432de5a',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:USDT',
      JSON.stringify({
        name: 'Tether',
        chainId: 1,
        symbol: 'USDT',
        symbolPair: 'USDT',
        decimals: 9,
        contractHash:
          'hash-da217de766096f168ad906a8eb2a8f48e32717bcf5fd1124188eda6193c6b7f7',
        packageHash:
          'hash-a7672d33a577d196a42b9936025c2edc22b25c20cc16b783a3790c8e35f71e0b',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:USDC',
      JSON.stringify({
        name: 'USD Coin',
        chainId: 1,
        symbol: 'USDC',
        symbolPair: 'USDC',
        decimals: 9,
        contractHash:
          'hash-b5aa8961b1dae0eab3e828da836911d339b30f3e90c8ed479eb797789fe8e9f2',
        packageHash:
          'hash-e43357d2be4f5cd2d744e218eb7bf79148f0fa777b111a71c6d587f054a50b44',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
      })
    ),
    client.set(
      'token-contract:dWBTC',
      JSON.stringify({
        name: 'Debug Wrapped BTC',
        chainId: 1,
        symbol: 'dWBTC',
        symbolPair: 'dWBTC',
        decimals: 8,
        contractHash:
          'hash-27dcb2efc403047a3f9fdad8acf879e3630706c9a38d28b8ef44201b1581fb3e',
        packageHash:
          'hash-a3bce716f129605e5c47147976b0053b5632106d184fb6903ae63aa883905af9',
        logoURI: null,
        amount: '0.0000',
        allowance: '0.0000',
        priceUSD: '0.00',
        optApproval: 'approve',
      })
    ),
  ]);
