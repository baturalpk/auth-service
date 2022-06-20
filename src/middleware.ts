import { ErrorRequestHandler, RequestHandler } from 'express';
import { CustomError } from './errors.js';

const allowedHttpMethods = [
    'POST',
    'DELETE',
    'OPTIONS',
    // TODO: Noted for possible future use-cases
    // 'PUT',
    // 'CONNECT',
    // 'GET',
]

const checkAllowedMethods : RequestHandler = (req, res, next) => {
    if (!allowedHttpMethods.includes(req.method)) {
        return res.sendStatus(405)
    }
    next()
}

const notFoundHandler : RequestHandler = (_req, res, _next) => res.sendStatus(404)

const errorHandler: ErrorRequestHandler = (err , _req, res, next) => {
    console.error(err);
    if (err instanceof CustomError) {
        return res.status(err.status).send(err.message)
    }
    return res.sendStatus(500)
}

export {
    checkAllowedMethods,
    notFoundHandler,
    errorHandler,
}
