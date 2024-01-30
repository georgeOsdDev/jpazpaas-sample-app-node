import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["httpstatus"],
    method: 'get',
    path: '/{code}',
    request: {
      params: z.object({
        code: z.string().openapi({
          description: 'http status code you want to receive. range of 200 to 599',
          example: '200',
        })
      }),
    },
    responses: {
      200: {
        description: 'Respond a specified http status code',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      },
      500: {
        description: 'RangeError: init["status"] must be in the range of 200 to 599.',
        content: {
          'application/json': {
            schema: z.strictObject({
              "error": z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    const code = Number(c.req.param('code'));
    if (code < 200 ||code > 599 || isNaN(code)) {
      return c.json({
        error: 'RangeError: init["status"] must be in the range of 200 to 599.'
      }, 500)
    }
    return c.json({message: `resoponded with ${code}`}, code)
  }
)

export default app
