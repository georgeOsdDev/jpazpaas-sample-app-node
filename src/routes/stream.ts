import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono';
import { stream, streamText, streamSSE } from 'hono/streaming'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["stream"],
    method: 'get',
    path: '/sse/{times}',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a message',
      }
    }
  }),
  (c) => {
  return streamSSE(c, async (stream) => {
    const times: number = isNaN(Number(c.req.param('times'))) ? 10 : Number(c.req.param('times'))
    let id = 0
    while (id < times) {
      const message = `It is ${new Date().toISOString()}`
      await stream.writeSSE({
        data: message,
        event: 'time-update',
        id: String(id++),
      })
      await stream.sleep(1000)
    }
  })
})

app.openapi(
  createRoute({
    tags: ["stream"],
    method: 'get',
    path: '/text/{waitms}',
    request: {
    },
    responses: {
      200: {
        description: 'Respond a message',
      }
    }
  }),
  (c) => {
  const waitms: number = isNaN(Number(c.req.param('waitms'))) ? 1000 : Number(c.req.param('waitms'))
  return streamText(c, async (stream) => {
    // Write a text with a new line ('\n').
    await stream.writeln(`Hello! It is ${new Date().toISOString()}`)
    // Wait 1 second.
    await stream.sleep(waitms)
    // Write a text without a new line.
    await stream.write( `Bye! It is ${new Date().toISOString()}`)
  })
})
export default app
