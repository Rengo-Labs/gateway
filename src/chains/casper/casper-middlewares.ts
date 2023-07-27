//import { HttpException } from '../../services/error-handler';
import { Casper } from './casper';
import { NextFunction, Request, Response } from 'express';

export const verifySolanaIsAvailable = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  /*if (!req || !req.body || !req.body.network) {
    console.log(req.body);
    throw new HttpException(404, 'No Casper network informed.');
  }*/

  console.log("Paso verificacion", req.body);
  const solana = await Casper.getInstance(req.body.network);
  if (!solana.ready) {
    await solana.init();
  }

  return next();
};
