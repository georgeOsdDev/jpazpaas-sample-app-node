import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { setCookie, deleteCookie } from 'hono/cookie'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["cookie"],
    method: 'get',
    path: '/{key}/{value}',
    request: {
      params: z.object({
        key: z.string().openapi({
          description: 'key of cookie',
          example: 'mykey',
        }),
        value: z.string().openapi({
          description: 'value of cookie',
          example: 'value',
        })
      }),
    },
    responses: {
      200: {
        description: 'Respond with updated cookie',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      },
    }
  }),
  (c) => {
    setCookie(c, c.req.param('key'), c.req.param('value'))
    return c.json({message: `done`})
  }
)

app.openapi(
  createRoute({
    tags: ["cookie"],
    method: 'delete',
    path: '/{key}',
    request: {
      params: z.object({
        key: z.string().openapi({
          description: 'key of cookie',
          example: 'mykey',
        }),
      }),
    },
    responses: {
      200: {
        description: 'Respond with deleted cookie',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      },
    }
  }),
  (c) => {
    deleteCookie(c, c.req.param('key'))
    return c.json({message: `done`})
  }
)

export default app
