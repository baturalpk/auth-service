import e, { RequestHandler } from "express";
import { hash } from 'bcrypt';
import { prisma } from '../prisma/client.js'
import { CustomError } from "../errors.js";
import { Prisma } from "@prisma/client";

const BcryptSaltRounds = 12

const CreateIdentity: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new CustomError(400, 'missing fields: "email" and/or "password"')
        }
        const hashedPassword = await hash(password, BcryptSaltRounds)
    
        await prisma.identity.create({
            data: { email, password: hashedPassword }
        })
        return res.sendStatus(201)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                next(new CustomError(400, 'existing email'))
            }
        }
        next(err)
    }
}

export default {
    CreateIdentity,
}