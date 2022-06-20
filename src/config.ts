// In case of integration with API Gateway or similar, this mode must be explicitly turned off
export const EndUserModeOn = mapEnvAsBool('END_USER_MODE_ON') ?? true

export const NodeEnv = mustMapEnv('NODE_ENV')

export const Server = {
    Host: process.env.HOST ?? '0.0.0.0',
    Port: mustMapEnvAsNum('PORT'),
}

export const Redis = {
    ConnectionString: mustMapEnv('REDIS_CONN_STRING')
}

function mustMapEnv(key: string): string {
    const val = process.env[key]
    if (val === undefined) {
        console.error(`undefined environment variable: ${ key }`)
        process.exit(1)
    }
    return val
}

function mustMapEnvAsNum(key: string): number {
    const val = parseInt(mustMapEnv(key))
    if (val === NaN) {
        console.error(`non-numeric environment variable: ${ key }`)
        process.exit(1)
    }
    return val
}

function mapEnvAsBool(key: string): boolean | undefined {
    const val = process.env[key]
    if (val === 'true') return true
    if (val === 'false') return false
    else return undefined
}
