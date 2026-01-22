import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

const envSectionSchema = z.record(z.string(), z.string().optional())
  .openapi({ description: 'Environment variables filtered by prefix' })

const acaEnvResponseSchema = z.object({
  kubernetes: envSectionSchema.openapi({
    description: 'Environment variables starting with KUBERNETES_',
    example: {
      KUBERNETES_SERVICE_PORT_HTTPS: '443',
      KUBERNETES_SERVICE_HOST: '100.100.224.1'
    }
  }),
  containerApp: envSectionSchema.openapi({
    description: 'Environment variables starting with CONTAINER_APP',
    example: {
      CONTAINER_APP_HOSTNAME: 'example.bluewater-xxxx.japaneast.azurecontainerapps.io',
      CONTAINER_APP_REVISION: 'my-app--0000001'
    }
  })
}).openapi({ description: 'Container Apps environment variables grouped by prefix' })

const headerDumpSchema = z.record(z.string(), z.string())
  .openapi({
    description: 'Request headers as received at ingress (keys are lower-cased by Hono)',
    example: {
      accept: '*/*',
      host: 'aca-in-vnet-nodeapp',
      'user-agent': 'curl/8.14.1',
      'x-arr-ssl': 'true',
      'x-envoy-expected-rq-timeout-ms': '1800000',
      'x-forwarded-path': '/request/dump',
      'x-forwarded-proto': 'https',
      'x-k8se-app-kind': 'web',
      'x-k8se-app-name': 'aca-in-vnet-nodeapp--0000001',
      'x-k8se-app-namespace': 'k8se-apps',
      'x-k8se-protocol': 'http1',
      'x-ms-containerapp-name': 'aca-in-vnet-nodeapp',
      'x-ms-containerapp-revision-name': 'aca-in-vnet-nodeapp--0000001',
      'x-request-id': 'f443460e-aa1b-42a8-80a3-9a2fb0c90168'
    }
  })

app.openapi(
  createRoute({
    tags: ['aca'],
    method: 'get',
    path: '/info/env',
    responses: {
      200: {
        description: 'Environment variables related to Kubernetes and Container Apps',
        content: {
          'application/json': {
            schema: acaEnvResponseSchema
          }
        }
      }
    }
  }),
  (c) => {
    const kubernetes: Record<string, string | undefined> = {}
    const containerApp: Record<string, string | undefined> = {}

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('KUBERNETES_')) {
        kubernetes[key] = value
      }
      if (key.startsWith('CONTAINER_APP')) {
        containerApp[key] = value
      }
    }

    return c.json({ kubernetes, containerApp })
  }
)

app.openapi(
  createRoute({
    tags: ['aca'],
    method: 'get',
    path: '/info/headers',
    responses: {
      200: {
        description: 'Request headers observed at Container Apps ingress',
        content: {
          'application/json': {
            schema: headerDumpSchema
          }
        }
      }
    }
  }),
  (c) => {
    // Hono lowercases incoming header keys
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(c.req.header())) {
      if (typeof value === 'string') headers[key] = value
    }
    return c.json(headers)
  }
)

export default app
