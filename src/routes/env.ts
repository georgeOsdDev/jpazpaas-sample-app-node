import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { basicAuth } from 'hono/basic-auth'

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
    },
  }),
  (c) => {
    // super simple check
    const code = c.req.query('code')
    if (code === 'secret') {
      return c.json(process.env)
    } else
      return c.json({error: 'code is not correct'}, 401)
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
    },
  }),
  (c) => {
    // super simple check
    const code = c.req.query('code')
    if (code === 'secret') {
      return c.json({[c.req.param('key')]: process.env[c.req.param('key')]})
    } else
      return c.json({error: 'code is not correct'}, 401)
  },
)

export default app
