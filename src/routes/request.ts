import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono';

const app = new OpenAPIHono()

const handler = async (c:Context) => {
  let body;
  if (c.req.header('content-type') === 'application/json') {
    body = await c.req.json()
  } else if (c.req.header('content-type') === 'application/x-www-form-urlencoded') {
    body = await c.req.parseBody()
  } else {
    body = await c.req.text()
  }
  return c.json({
    'queries': c.req.query(),
    'headers': c.req.header(),
    'body': body,
  }, 200)
}

app.openapi(
  createRoute({
    tags: ["request"],
    method: 'get',
    path: '/dump',
    request: {
    },
    responses: {
      200: {
        description: 'Dump raw request',
        content: {
          'application/json': {
            schema: z.strictObject({
              "queries": z.strictObject({}),
              "headers":  z.strictObject({}),
              "body": z.strictObject({}),
            })
          }
        }
      }
    }
  }),
  handler
)

app.openapi(
  createRoute({
    tags: ["request"],
    method: 'post',
    path: '/dumpJson',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Dump raw request',
        content: {
          'application/json': {
            schema: z.strictObject({
              "queries": z.strictObject({}),
              "headers":  z.strictObject({}),
              "body": z.strictObject({}),
            })
          }
        }
      }
    }
  }),
  handler
)

app.openapi(
  createRoute({
    tags: ["request"],
    method: 'post',
    path: '/dumpForm',
    request: {
      body: {
        content: {
          'application/x-www-form-urlencoded': {
            schema: z.object({
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Dump raw request',
        content: {
          'application/json': {
            schema: z.strictObject({
              "queries": z.strictObject({}),
              "headers":  z.strictObject({}),
              "body": z.strictObject({}),
            })
          }
        }
      }
    }
  }),
  handler
)

export default app
