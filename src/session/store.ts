import { createClient } from 'redis';
import { Redis } from '../config.js';

const FieldId = 'id'
const FieldSessionId = 'sid'
const FieldEmail = 'email'
const TTL = 259200

const client = createClient({
    url: Redis.ConnectionString
})

client.on('error', (err) => {
    console.error('couldn\'t create redis client:', err)
    process.exit(1)
});

await client.connect();

const Save = async (key: string, id: string, sessionId: string, email: string) => {
    await client
        .multi()
        .hSet(key, [FieldId, id, FieldSessionId, sessionId, FieldEmail, email])
        .expire(key, TTL, 'LT')
        .exec()
}

interface RetrieveByKeyReply {
    id: string
    sessionId: string
    email: string
}

const RetrieveByKey = async (key: string): Promise<RetrieveByKeyReply> => {
    const reply = await client.hGetAll(key)
    return new Promise<RetrieveByKeyReply>((resolve) => {
        resolve({
            id: reply[FieldId],
            sessionId: reply[FieldSessionId],
            email: reply[FieldEmail]
        })
    })
}

const Remove = async (key: string) => {
    await client.del(key)
}

export default {
    TTL,
    Save,
    RetrieveByKey,
    Remove,
}
