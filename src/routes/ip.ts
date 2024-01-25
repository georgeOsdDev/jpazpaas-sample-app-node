import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

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
              "X-Forwarded-For": z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    return c.jsonT({
      'X-Azure-ClientIP':c.req.header('X-Azure-ClientIP') || 'not set',
      'X-Forwarded-For':c.req.header('X-Forwarded-For') || 'not set'
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
