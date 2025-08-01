import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["misc"],
    method: 'get',
    path: '/echo/{text}',
    request: {
      params: z.object({
        text: z
          .string()
          .openapi({
            param: {
              name: 'text',
              in: 'path',
            },
            example: 'hello',
          }),
      }),
    },
    responses: {
      200: {
        description: 'Respond a message',
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
    return c.json({
      message: c.req.param('text')
    })
  }
)

app.openapi(
  createRoute({
    tags: ["misc"],
    method: 'get',
    path: '/wait/{ms}',
    request: {
      params: z.object({
        ms: z
          .string()
          .openapi({
            param: {
              name: 'ms',
              in: 'path',
            },
            example: '1000',
          }),
      }),
    },
    responses: {
      200: {
        description: 'Respond a message',
        content: {
          'application/json': {
            schema: z.strictObject({
              startISOString: z.string(),
              startTime: z.number(),
              endISOString: z.string(),
              endTime: z.number(),
            })
          }
        }
      }
    }
  }),
  (c) => {
    const waitms: number = isNaN(Number(c.req.param('ms'))) ? 1000 : Number(c.req.param('ms'))
    return new Promise((resolve) => {
      const st = new Date();
      setTimeout(() => {
        const ed = new Date();
        resolve(c.json({
          startISOString: st.toISOString(),
          startTime: st.getTime(),
          endISOString: ed.toISOString(),
          endTime: ed.getTime(),
        }))
      }, waitms)
    })
  }
)


app.openapi(
  createRoute({
    tags: ["misc"],
    method: 'get',
    path: '/exception',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a exception',
        content: {
          'text/plain': {
            schema: z.string()
          }
        }
      }
    }
  }),
  (c) => {
    throw Error("Hello Exception")
  }
)

app.openapi(
  createRoute({
    tags: ["misc"],
    method: 'get',
    path: '/logging',
    request: {
    },
    responses: {
      200: {
        description: 'Respond ok',
      }
    }
  }),
  (c) => {
    console.log("console.log message")
    console.trace("console.tace message")
    console.debug("console.debug message")
    console.info("console.info message")
    console.warn("console.warn message")
    console.error("console.error message")
    console.assert(false, "console.assert false message")
    return c.text("Hello Logging")
  }
)


export default app
