export interface RequestIdentity {
    id: string
    email: string
}

declare global {
    namespace Express {
        interface Request {
            identity: RequestIdentity
        }
    }
}
