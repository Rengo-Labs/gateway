import { NextFunction, Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { Casper } from './casper';
//import { verifySolanaIsAvailable } from './solana-middlewares';
import { asyncHandler } from '../../services/error-handler';
import {
  balances,
  getOrCreateTokenAccount,
  poll,
  token,
} from './casper.controllers';
import {
  CasperBalanceRequest,
  CasperBalanceResponse,
  CasperPollRequest,
  CasperPollResponse,
  CasperTokenRequest,
  CasperTokenResponse,
} from './casper.requests';
import {
  validateSolanaBalanceRequest,
  validateSolanaGetTokenRequest,
  validateSolanaPollRequest,
  validateSolanaPostTokenRequest,
} from './casper.validators';

export namespace SolanaRoutes {
  export const router = Router();

  export const getCasper = async (request: Request) => {
    console.log('Paso 1', request.body, request.body.network);
    const casper = await Casper.getInstance(request.body.network);
    await casper.init();
    return casper;
  };

  //router.use(asyncHandler(verifySolanaIsAvailable));

  router.get(
    '/',
    asyncHandler(async (request: Request, response: Response) => {
      const casper = await getCasper(request);

      const rpcUrl = casper.rpcUrl;

      response.status(200).json({
        network: casper.chain,
        rpcUrl: rpcUrl,
        connection: true,
        timestamp: Date.now(),
      });
    })
  );

  // Get all token accounts and balances + solana balance
  router.get(
    '/balances',
    asyncHandler(
      async (
        request: Request<ParamsDictionary, unknown, CasperBalanceRequest>,
        response: Response<CasperBalanceResponse | string>,
        _next: NextFunction
      ) => {
        const casper = await getCasper(request);

        validateSolanaBalanceRequest(request.body);
        response.status(200).json(await balances(casper, request.body));
      }
    )
  );

  // Checks whether this specific token account exists and returns its balance, if it does.
  router.get(
    '/token',
    asyncHandler(
      async (
        request: Request<ParamsDictionary, unknown, CasperTokenRequest>,
        response: Response<CasperTokenResponse | string>,
        _next: NextFunction
      ) => {
        const casper = await getCasper(request);

        validateSolanaGetTokenRequest(request.body);
        response.status(200).json(await token(casper, request.body));
      }
    )
  );

  // Creates a new associated token account, if not existent
  router.post(
    '/token',
    asyncHandler(
      async (
        request: Request<ParamsDictionary, unknown, CasperTokenRequest>,
        response: Response<CasperTokenResponse | string>,
        _next: NextFunction
      ) => {
        const casper = await getCasper(request);

        validateSolanaPostTokenRequest(request.body);
        response
          .status(200)
          .json(await getOrCreateTokenAccount(casper, request.body));
      }
    )
  );

  // TODO Check the possibility to change to a GET method (consider the Ethereum implementation)
  // Gets status information about given transaction hash
  router.post(
    '/poll',
    asyncHandler(
      async (
        request: Request<ParamsDictionary, unknown, CasperPollRequest>,
        response: Response<CasperPollResponse>
      ) => {
        const casper = await getCasper(request);

        validateSolanaPollRequest(request.body);
        response.status(200).json(await poll(casper, request.body));
      }
    )
  );
}
