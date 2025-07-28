import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthorizedRequest = Request & {
  authorizedUserId: string;
};

type DecodedToken = {
  userId: string;
};

function authorizeRequest(req: AuthorizedRequest, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    req.authorizedUserId = decodedToken.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }
}

export { authorizeRequest };
