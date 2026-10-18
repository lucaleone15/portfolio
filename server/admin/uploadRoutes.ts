import path from 'node:path';
import { readBody, type ApiRoute } from './handler';
import { processUpload, UploadError, UPLOAD_LIMITS, type UploadKind } from './uploads';
import { tooLargeMessage } from '../../src/content/uploadLimits';

/** POST uploads?kind=image|video|pdf&folder=…&filename=…, raw body → { src, width?, height? } */
export function createUploadRoutes(dataDir: string): ApiRoute {
  const stagingDir = path.join(dataDir, 'admin', 'uploads');
  return async (ctx) => {
    if (ctx.route !== '/uploads' || ctx.req.method !== 'POST') return false;
    const kind = ctx.query.get('kind') as UploadKind;
    if (!(kind in UPLOAD_LIMITS)) {
      ctx.send(422, { error: 'Type de fichier inconnu.' });
      return true;
    }
    const limit = UPLOAD_LIMITS[kind];
    const tooLarge = () => ctx.send(413, { error: tooLargeMessage(kind) });
    let body: Buffer;
    try {
      body = await readBody(ctx.req, limit);
    } catch (err) {
      if ((err as { status?: number }).status === 413) tooLarge();
      else throw err;
      return true;
    }
    try {
      ctx.send(200, await processUpload({ kind, filename: ctx.query.get('filename') ?? 'fichier', folder: ctx.query.get('folder') ?? '', body, stagingDir }));
    } catch (err) {
      if (!(err instanceof UploadError)) throw err;
      ctx.send(422, { error: err.message });
    }
    return true;
  };
}
