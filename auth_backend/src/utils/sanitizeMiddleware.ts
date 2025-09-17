import { Request, Response, NextFunction } from 'express';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Recursively sanitize all string values in an object
const deepSanitize = (obj: unknown): unknown => {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }
  return obj;
};

const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.body) req.body = deepSanitize(req.body) as typeof req.body;
  if (req.query) req.query = deepSanitize(req.query) as typeof req.query;
  if (req.params) req.params = deepSanitize(req.params) as typeof req.params;
  next();
};

export default sanitizeRequest;
