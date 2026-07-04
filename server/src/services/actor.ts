import { randomUUID } from 'node:crypto';
import { UserModel } from '../models/index.js';
import { tryGetUserId, type AuthedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

const ANON_ID = /^anon-[0-9a-fA-F-]{36}$/;

/**
 * Resolve who is acting: a JWT session if present, otherwise a client-supplied anonymousId
 * (device-scoped, same id the PWA's LocalProvider generates). No login required (P: zero
 * friction); the user document is created on first sight so progress is never lost.
 */
export async function resolveActor(req: AuthedRequest, anonymousId?: string): Promise<string> {
  const fromToken = tryGetUserId(req);
  if (fromToken) return fromToken;
  if (anonymousId && ANON_ID.test(anonymousId)) {
    await UserModel.updateOne(
      { _id: anonymousId },
      {
        $setOnInsert: {
          _id: anonymousId,
          identities: [{ provider: 'anonymous', subject: randomUUID() }],
          createdAt: new Date().toISOString(),
          settings: { playbackRate: 1, dyslexiaFont: false },
        },
      },
      { upsert: true },
    );
    return anonymousId;
  }
  throw new AppError(401, 'unauthenticated', 'Provide a session token or a valid anonymousId');
}
