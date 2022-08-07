import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import helmet from 'helmet';
import { Server as httpServer } from 'http';
import { createServer, Server as httpsServer } from 'https';
import morgan from 'morgan';
import { setTimeout } from 'timers/promises';
import { Server } from './config.js';
import identityRouter from './identity/router.js';
import { checkAllowedMethods, errorHandler, notFoundHandler } from './middleware.js';
import { DisconnectPrisma } from './prisma/client.js';
import sessionRouter from './session/router.js';
import { DisconnectRedis } from './session/store.js';

const app: Application = express();

// Register middleware
app.use(morgan('short'));
app.use(checkAllowedMethods); // Exclude disallowed HTTP methods
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Register routers
app.use('/identity', identityRouter);
app.use('/session', sessionRouter);

app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Error handler

let server: httpServer | httpsServer;

if (!Server.TLS.Active) {
    server = app.listen(Server.Port, Server.Host, () => {
        console.log('To activate the TLS, set environment expilicitly: TLS_ACTIVE=true');
        console.log(
            `🛑 [HTTP-Unsecure] auth-service is listening on "${Server.Host}:${Server.Port}"...`
        );
    });
} else {
    server = createServer(
        {
            cert: Server.TLS.Cert,
            key: Server.TLS.Key,
        },
        app
    ).listen(Server.Port, Server.Host, () => {
        console.log(`🟢 [HTTPS] auth-service is listening on "${Server.Host}:${Server.Port}"...`);
    });
}

process.on('SIGTERM', () => {
    console.log('Shutting down the service...');
    server.close(async err => {
        if (err) {
            console.error('An error occured while closing the server:', err);
        }
        await Promise.all([
            DisconnectPrisma(),
            DisconnectRedis(),
            setTimeout(15000, ForceShutdown()),
        ]);

        console.log('🔌 Gracefully shut down the service.');
        process.exit(0);
    });
});

const ForceShutdown = () => {
    console.log("...couldn't shut down the service gracefully. Forced to exit!");
    process.exit(1);
};
