import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["healthcheck"],
    method: 'get',
    path: '/ok',
    request: {
    },
    responses: {
      200: {
        description: 'ok response',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    return c.json({message: `ok`}, 200)
  }
)


app.openapi(
  createRoute({
    tags: ["healthcheck"],
    method: 'get',
    path: '/ng',
    request: {
    },
    responses: {
      500: {
        description: 'ng response',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    return c.json({message: `ng`}, 500)
  }
)

app.openapi(
  createRoute({
    tags: ["healthcheck"],
    method: 'get',
    path: '/instance/{COMPUTERNAME}',
    request: {
      params: z.object({
        COMPUTERNAME: z.string().openapi({
          description: 'instancename to be ok',
          example: 'LW0SDLWK0000B8',
        })
      }),
    },
    responses: {
      200: {
        description: 'ok response if COMPUTERNAME is same as the one in the path',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      },
      500: {
        description: 'ng response if COMPUTERNAME is same as the one in the path',
        content: {
          'application/json': {
            schema: z.strictObject({
              message: z.string()
            })
          }
        }
      }
    }
  }),
  (c) => {
    const machiname = process.env.COMPUTERNAME || "none";
    const httpStatus = process.env.COMPUTERNAME  == c.req.param('COMPUTERNAME') ? 200 : 500;
    return c.json({message: machiname}, httpStatus)
  }
)

export default app
