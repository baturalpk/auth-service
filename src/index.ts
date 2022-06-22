import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import helmet from 'helmet';
import { createServer } from 'https';
import morgan from 'morgan';
import { Server } from './config.js';
import identityRouter from './identity/router.js';
import { checkAllowedMethods, errorHandler, notFoundHandler } from './middleware.js';
import sessionRouter from './session/router.js';

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

if (!Server.TLS.Active) {
    app.listen(Server.Port, Server.Host, () => {
        console.log('To activate the TLS, set environment expilicitly: TLS_ACTIVE=true');
        console.log(
            `🛑 [HTTP-Unsecure] auth-service is listening on "${Server.Host}:${Server.Port}"...`
        );
    });
} else {
    createServer(
        {
            cert: Server.TLS.Cert,
            key: Server.TLS.Key,
        },
        app
    ).listen(Server.Port, Server.Host, () => {
        console.log(`🟢 [HTTPS] auth-service is listening on "${Server.Host}:${Server.Port}"...`);
    });
}
