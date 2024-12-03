import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { credential, initializeApp } from 'firebase-admin';

const firebase_params = {};

@Injectable()
export class PreauthMiddleWare implements NestMiddleware {
  private defaultApp: any;

  constructor() {
    this.defaultApp = initializeApp({
      credential: credential.cert(firebase_params),
      databaseURL: '',
    });
  }

  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    next();
  }
}
