import type { IncomingMessage, ServerResponse } from 'http';
import { handleSmtpStatusRequest } from '../src/services/sendOtpHandler';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  handleSmtpStatusRequest(req, res);
}
