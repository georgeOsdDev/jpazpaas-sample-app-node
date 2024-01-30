import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["env"],
    method: 'get',
    path: '/',
    request: {
    },
    responses: {
      200: {
        description: 'Respond all environment value',
        content: {
          'application/json': {
            schema: z.strictObject({})
          }
        }
      }
    }
  }),
  (c) => {
    return c.json(process.env)
  }
)

app.openapi(
  createRoute({
    tags: ["env"],
    method: 'get',
    path: '/{key}',
    request: {
      params: z.object({
        key: z.string().openapi({
          example: 'LANG',
        })
      }),
    },
    responses: {
      200: {
        description: 'Respond a specified environment value',
        content: {
          'application/json': {
            schema: z.strictObject({})
          }
        }
      }
    }
  }),
  (c) => {
    return c.json({[c.req.param('key')]: process.env[c.req.param('key')]})
  }
)

export default app
