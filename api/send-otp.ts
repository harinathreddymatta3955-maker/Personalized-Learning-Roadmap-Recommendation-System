import type { IncomingMessage, ServerResponse } from 'http';
import { handleSendOtpRequest } from '../src/services/sendOtpHandler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleSendOtpRequest(req, res);
}
