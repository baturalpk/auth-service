import cookieParser from 'cookie-parser';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from './config.js';
import identityRouter from './identity/router.js';
import {
    checkAllowedMethods,
    errorHandler,
    notFoundHandler,
} from './middleware.js';
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

app.listen(Server.Port, Server.Host, () => {
    console.log(
        `auth-service is listening on "${Server.Host}:${Server.Port}"...`
    );
});
