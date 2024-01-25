import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const ipapi = new OpenAPIHono()

ipapi.openapi(
  createRoute({
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

ipapi.openapi(
  createRoute({
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

export { ipapi }
