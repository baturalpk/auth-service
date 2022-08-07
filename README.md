## @baturalpk/auth-service 💂🏼‍♀️

## Getting started
### 🐳 Run as a container (no-TLS)
```sh
> docker pull ghcr.io/baturalpk/auth-service:latest

> docker run -d -p 9000:9000 \
    -e END_USER_MODE_ON=false \
    -e NODE_ENV=development \
    -e POSTGRES_URL=postgres://... \
    -e REDIS_CONN_STRING=redis://... \
    -e PORT=9000 \
    -e TLS_ACTIVE=false \
    ghcr.io/baturalpk/auth-service:latest
    
# The service will be reachable from "localhost:9000"
```
