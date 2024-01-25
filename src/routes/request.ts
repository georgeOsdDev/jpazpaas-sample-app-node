import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono';

const requestapi = new OpenAPIHono()

const handler = async (c:Context) => {
  const headers: Record<string, string> = {};
  Object.entries(c.req.raw.headers).forEach(([k, v]) => headers[k] = v);
  let body;
  if (c.req.header('content-type') === 'application/json') {
    body = await c.req.json()
  } else if (c.req.header('content-type') === 'application/x-www-form-urlencoded') {
    body = await c.req.parseBody()
  } else {
    body = await c.req.text()
  }
  return c.json({
    'headers': headers,
    'body': body,
  })
}

requestapi.openapi(
  createRoute({
    method: 'get',
    path: '/request/dump',
    request: {
    },
    responses: {
      200: {
        description: 'Dump raw request',
        content: {
          'application/json': {
            schema: z.strictObject({
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

requestapi.openapi(
  createRoute({
    method: 'post',
    path: '/request/dump',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string(),
              age: z.number(),
            }),
          },
          'application/x-www-form-urlencoded': {
            schema: z.object({
              name: z.string(),
              age: z.number(),
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


export { requestapi }
