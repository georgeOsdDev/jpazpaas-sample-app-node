# Node.js Sample App for Azure App Service

This is a comprehensive Node.js sample application built with Hono framework for testing various Azure App Service features and functionalities.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

This sample app provides various endpoints for testing different aspects of web applications:

### 🌐 Main Features
- **OpenAPI/Swagger Documentation**: Available at `/ui`
- **Static File Serving**: Files served from `/static/*`
- **Request Logging**: All requests are logged with headers
- **JSX Components**: Server-side rendered React components

### 📡 Available API Endpoints

#### IP Address Information (`/ip`)
- `GET /ip/inbound` - Get client IP address from Azure headers
- `GET /ip/outbound` - Get server's outbound IP address
- `GET /ip/private` - Get private IP address from Azure environment

#### File Operations (`/file`)
- `POST /file/write` - Write content to a file
- `GET /file/read` - Read content from a file
- `POST /file/upload` - Upload files via multipart form

#### Environment Variables (`/env`)
- `GET /env/?code={code}` - Get all environment variables (requires auth code)
- `GET /env/{key}?code={code}` - Get specific environment variable

#### HTTP Status Testing (`/httpstatus`)
- `GET /httpstatus/{code}` - Return specified HTTP status code (200-599)

#### Cookie Management (`/cookie`)
- `GET /cookie/{key}/{value}` - Set a cookie
- `DELETE /cookie/{key}` - Delete a cookie

#### Request Inspection (`/request`)
- `GET /request/dump` - Dump request details (queries, headers, body)
- `POST /request/dumpJson` - Dump JSON request details
- `POST /request/dumpForm` - Dump form request details

#### Streaming (`/stream`)
- `GET /stream/sse/{times}` - Server-Sent Events stream
- `GET /stream/text/{waitms}` - Text streaming with delay
- `GET /stream/text/keepalive/{times}` - Keep-alive text streaming

#### Performance Testing (`/bench`)
- `GET /bench/memory/{mbytes}` - Memory usage test
- `GET /bench/cpu/{loops}` - CPU intensive task test

#### Health Checks (`/healthcheck`)
- `GET /healthcheck/ok` - Always returns 200 OK
- `GET /healthcheck/ng` - Always returns 500 error
- `GET /healthcheck/instance/{COMPUTERNAME}` - Instance-specific health check

#### Redirects (`/redirect`)
- `GET /redirect/301` - 301 redirect to home
- `GET /redirect/302` - 302 redirect to home
- `GET /redirect/example301` - 301 redirect to example.com
- `GET /redirect/example302` - 302 redirect to example.com

#### Proxy (`/proxy`)
- `GET /proxy/{url}` - Proxy GET request to specified URL
- `POST /proxy/{url}` - Proxy POST request to specified URL

#### Miscellaneous (`/misc`)
- `GET /misc/echo/{text}` - Echo back the provided text
- `GET /misc/wait/{ms}` - Wait for specified milliseconds and return timing info
- `GET /misc/exception` - Throw an exception for error testing

## Project Structure

```
├── src/
│   ├── index.tsx          # Main application entry point
│   └── routes/            # API route handlers
│       ├── bench.ts       # Performance testing endpoints
│       ├── cookie.ts      # Cookie management
│       ├── env.ts         # Environment variable access
│       ├── file.ts        # File operations
│       ├── healthcheck.ts # Health check endpoints
│       ├── httpstatus.ts  # HTTP status testing
│       ├── index.ts       # Routes index
│       ├── ip.ts          # IP address utilities
│       ├── misc.ts        # Miscellaneous utilities
│       ├── proxy.ts       # Proxy functionality
│       ├── redirect.ts    # Redirect testing
│       ├── request.ts     # Request inspection
│       └── stream.ts      # Streaming responses
├── static/                # Static files directory
├── Dockerfile            # Container configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `env_code` - Authentication code for environment endpoints
- `COMPUTERNAME` - Instance name for health checks
- `WEBSITE_PRIVATE_IP` - Azure private IP address

### Scripts
- `npm run dev` - Development server with hot reload
- `npm start` - Production server

## Docker Support

Build and run with Docker:

```bash
docker build -t sample-app .
docker run -p 8080:8080 sample-app
```

### OpenSSH security updates

The image preserves Node.js 25.4.0 and Alpine 3.23 to avoid an unrelated
runtime upgrade. Node.js 25 is end-of-life; migrate to a supported Node.js
release separately.

SSH on port 2222, password authentication, and the existing App Service SSH
integration remain enabled. The Dockerfile requires OpenSSH `10.2_p1-r1`
or later, which includes Alpine 3.23's fix for the musl password
authentication bypass. Do not remove this minimum version.

Rebuild with fresh package indexes and publish under a new tag:

```bash
docker build --pull --no-cache -t <registry>/honoapp:<new-tag> .
docker run --rm --entrypoint /bin/sh <registry>/honoapp:<new-tag> \
  -c 'apk info -v | grep "^openssh-server-"; /usr/sbin/sshd -t'
docker push <registry>/honoapp:<new-tag>
```

Update every consuming App Service and Container App to the new tag.
Publishing an image alone does not update running containers. Preserve stopped
applications' state unless startup is explicitly intended. Keep the previous
image for rollback, and check Defender's reassessment after deployment.

## Azure App Service Deployment

This application is configured for Azure App Service deployment with:
- `.deployment` file for build configuration
- `.dockerignore` for container builds
- Environment variable support for Azure-specific headers

## API Documentation

Once running, visit `/ui` for interactive Swagger documentation of all available endpoints.

## Testing Features

This app is designed to test various aspects of web applications:
- Load testing with CPU and memory benchmarks
- Network connectivity with proxy and outbound IP detection
- File system operations
- Environment variable access
- HTTP protocol features (status codes, redirects, streaming)
- Request/response inspection
