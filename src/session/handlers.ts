import dayjs from 'dayjs';
import { CookieOptions, RequestHandler } from 'express';
import { v4 as genUUID } from 'uuid';
import { EndUserModeOn, NodeEnv } from '../config.js';
import { CustomError } from '../errors.js';
import store from './store.js';

const TransientIdCookie = 'tid';
const SessionIdCookie = 'sid';

const NewSession: RequestHandler = async (req, res, next) => {
    try {
        // Present "only_via_cookies" flag to NOT return
        // authorization identifiers in response body.
        const { only_via_cookie } = req.query;

        const identity = req.identity;
        if (identity === undefined) {
            return res.sendStatus(500);
        }
        const { id, email } = identity;

        const tid = genUUID(),
            sid = genUUID();
        await store.Save(tid, id, sid, email);

        const cookieOpts: CookieOptions = {
            expires: dayjs().add(store.TTL, 'seconds').toDate(), // fallback
            maxAge: store.TTL,
            httpOnly: true,
            secure: NodeEnv !== 'development',
        };

        const body = `{
                "${TransientIdCookie}": "${tid}",
                "${SessionIdCookie}": "${sid}"
            }`;

        return res
            .cookie(TransientIdCookie, tid, cookieOpts)
            .cookie(SessionIdCookie, sid, cookieOpts)
            .json(only_via_cookie !== undefined ? {} : JSON.parse(body));
    } catch (error) {
        next(error);
    }
};

const ValidateSessionError = new CustomError(401, 'invalid and/or expired session');

const ValidateSession: RequestHandler = async (req, res, next) => {
    try {
        const tid = req.cookies[TransientIdCookie] ?? req.query[TransientIdCookie];
        const sid = req.cookies[SessionIdCookie] ?? req.query[SessionIdCookie];

        if (tid === undefined || sid === undefined) {
            throw ValidateSessionError;
        }

        const stored = await store.RetrieveByKey(tid);
        if (sid !== stored.sessionId) {
            throw ValidateSessionError;
        }

        // Expose 'actual' unique identifier (primary key) of identity owner to be used by
        // non-end-user systems, e.g., cluster-wide internal services, API gateways
        if (!EndUserModeOn) {
            return res.send({ id: stored.id, email: stored.email });
        }
        return res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};

const DestroySession: RequestHandler = async (req, res, next) => {
    try {
        const tid = req.cookies[TransientIdCookie] ?? req.query[TransientIdCookie];
        await store.Remove(tid);
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

export default {
    NewSession,
    ValidateSession,
    DestroySession,
};
