import { RequestHandler } from "express"
import { compare } from 'bcrypt';
import { CustomError } from "../errors.js";
import { prisma } from '../prisma/client.js';

const VerifyIdentityError = new CustomError(400, 'email or password is incorrect')

const VerifyIdentity: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new CustomError(400, 'missing fields: "email" and/or "password"')
        }

        const identity = await prisma.identity.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                blacklisted: true,
            },
        })
        if (identity === null) {
            throw VerifyIdentityError
        }
        if (identity.blacklisted) {
            return res.sendStatus(403)
        }

        const doPassMatch = await compare(password, identity.password)
        if (!doPassMatch) {
            throw VerifyIdentityError
        }

        req.identity = {
            id: String(identity.id),
            email: identity.email
        }
        next()
    } catch (err) {
        next(err)
    }
}

export { VerifyIdentity }
