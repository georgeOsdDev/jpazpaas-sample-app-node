const fs = require('fs').promises
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const FILE = "fileReadWite.txt"
const FILE_UPLOAD_DIR = "upload"
const app = new OpenAPIHono()


app.openapi(
  createRoute({
    tags: ["file"],
    method: 'post',
    path: '/write',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              content: z.string(),
            }),
          },
        }
      }
    },
    responses: {
      200: {
        description: 'Respond a request ip address',
        content: {
          'application/json': {
            schema: z.strictObject({
              result: z.string(),
            }),
          }
        }
      }
    }
  }),
  async (c) => {
    const data = c.req.json()
    let result: string
    try {
      await fs.writeFile(FILE, JSON.stringify({
        updateTime: Date.now(),
        ...data
      }))
      result = 'ok'
    } catch (error) {
      console.log("Faild to write file", error)
      c.status(500)
      result = 'ng'
    }
    return c.json({result})
  }
)

app.openapi(
  createRoute({
    tags: ["file"],
    method: 'get',
    path: '/read',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a request ip address',
        content: {
          'application/json': {
            schema: z.strictObject({
              content: z.string(),
            }),
          }
        }
      }
    }
  }),
  async (c) => {
    try {
      const content = await fs.readFile(FILE, 'utf8')
      console.log("read file", content)
      return c.json({content})
    } catch (error) {
      console.log("Faild to read file", error)
      c.status(500)
      return c.json({content: 'failed to read file'})
    }
  }
)

app.openapi(
  createRoute({
    tags: ["file"],
    method: 'post',
    path: '/upload',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.string(),
            }),
          },
        }
      }
    },
    responses: {
      200: {
        description: 'Respond a request ip address',
        content: {
          'application/json': {
            schema: z.strictObject({
              result: z.string(),
            }),
          }
        }
      }
    }
  }),
  async (c) => {
    try {
      const body = await c.req.parseBody()
      console.log(body['file'])
      return c.json({result: 'ok'})
    } catch (error) {
      console.log("Faild to write file", error)
      c.status(500)
      return c.json({result: 'failed to read uploaded file'})
    }
  }
)

export default app
