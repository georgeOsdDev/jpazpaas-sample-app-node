import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { setCookie, deleteCookie } from 'hono/cookie'
import { decode } from 'punycode'
import { resourceLimits } from 'worker_threads'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["proxy"],
    method: 'get',
    path: '/{url}',
    request: {
      params: z.object({
        url: z.string().openapi({
          description: 'url to proxy',
          example: 'https://example.com',
        }),
      }),
    },
    responses: {
      200: {
        description: 'Respond a proxy result',
        content: {
          'application/json': {
            schema: z.strictObject({
              status: z.number(),
              body: z.string(),
            })
          }
        }
      },
    }
  }),
  async (c) => {
    const url = decodeURIComponent(c.req.param('url'))
    const result = await fetch(url)
    return c.json({
      status: result.status,
      body: await result.text()
    })
  }
)

app.openapi(
  createRoute({
    tags: ["proxy"],
    method: 'post',
    path: '/{url}',
    request: {
      params: z.object({
        url: z.string().openapi({
          description: 'url to proxy',
          example: 'https://example.com',
        }),
      }),
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
        description: 'Respond a proxy result',
        content: {
          'application/json': {
            schema: z.strictObject({
              status: z.number(),
              body: z.string(),
            })
          }
        }
      },
    }
  }),
  async (c) => {
    const url = decodeURIComponent(c.req.param('url'))
    const result = await fetch(url,{
      method: "POST",
      body: await c.req.json()
    })
    return c.json({
      status: result.status,
      body: await result.text()
    })
  }
)

export default app
