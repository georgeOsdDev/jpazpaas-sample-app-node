import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { getConnInfo } from '@hono/node-server/conninfo'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["ip"],
    method: 'get',
    path: '/inbound',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a request ip address',
        content: {
          'application/json': {
            schema: z.strictObject({
              "X-Azure-ClientIP": z.string(),
              "X-Forwarded-For": z.string(),
              "remoteAddress": z.string().openapi({
                description: 'IP address from socket connection (may be proxy internal IP in ACA)'
              })
            })
          }
        }
      }
    }
  }),
  (c) => {
    // Get IP from connection info using Hono's getConnInfo helper
    // In ACA with Envoy proxy, this will be the proxy IP (100.x.x.x range)
    const connInfo = getConnInfo(c)
    const remoteAddress = connInfo?.remote?.address || 'unknown'

    return c.json({
      'X-Azure-ClientIP':c.req.header('X-Azure-ClientIP') || 'not set',
      'X-Forwarded-For':c.req.header('X-Forwarded-For') || 'not set',
      'remoteAddress': remoteAddress
    })
  }
)

app.openapi(
  createRoute({
    tags: ["ip"],
    method: 'get',
    path: '/outbound',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a outbound ip address of this server',
        content: {
          'application/json': {
            schema: z.strictObject({})
          }
        }
      }
    }
  }),
  async (c) => {
    try {
      const res = await fetch('https://httpbin.org/ip')
      return c.json(await res.json())
    } catch (error) {
      return c.json({
        error,
      })
    }
  }
)

app.openapi(
  createRoute({
    tags: ["ip"],
    method: 'get',
    path: '/private',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a private ip address of this server',
        content: {
          'application/json': {
            schema: z.strictObject({
              WEBSITE_PRIVATE_IP: z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    return c.json({"WEBSITE_PRIVATE_IP":process.env['WEBSITE_PRIVATE_IP'] || "not set"})
  }
)

export default app
