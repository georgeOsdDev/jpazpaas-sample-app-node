const os = require('os')
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["bench"],
    method: 'get',
    path: '/memory/{mbytes}',
    request: {
      params: z.object({
        mbytes: z.string().openapi({
          example: '1024',
        })
      }),
    },
    responses: {
      200: {
        description: 'Respond all environment value',
        content: {
          'application/json': {
            schema: z.strictObject({
              heapUsedMB: z.number().openapi({
                description: 'process.memoryUsage().heapUsed / 1024 / 1024',
              }),
              totalmemMB: z.number().openapi({
                description: 'os.totalmem() / 1024 / 1024',
              }),
              freememMB: z.number().openapi({
                description: 'os.freemem() / 1024 / 1024',
              }),
            })
          }
        }
      }
    }
  }),
  (c) => {
    let current = process.memoryUsage().heapUsed / 1024 / 1024;
    let target = Number(c.req.param('mbytes'));
    let arr = [];
    while(current < target) {
      arr.push(new Array(1024*1024).fill(0))
      current = process.memoryUsage().heapUsed / 1024 / 1024;
    }
    const totalmem = os.totalmem();
    const freemem = os.freemem();
    arr = [];
    return c.json({
      heapUsedMB: Math.round(current),
      totalmemMB: Math.round(os.totalmem() / 1024 / 1024),
      freememMB: Math.round(os.freemem() / 1024 / 1024),
    })
  }
)


function highLoadTask(loop: number): {loop: number, startTime: string, endTime: string, blockedTime: number} {
  const target = loop * 10_000_000_000;
  const st = new Date();
  console.log("start blocking task ", st.getTime());
  for (let i = 0; i < target; i++) {
  }
  const et = new Date();
  const blockedTime = et.getTime() - st.getTime();
  console.log(`end blocking task. Time taken = ${blockedTime}ms`);
  return {
    loop,
    startTime: st.toISOString(),
    endTime: et.toISOString(),
    blockedTime,
  }
}

app.openapi(
  createRoute({
    tags: ["bench"],
    method: 'get',
    path: '/cpu/{loops}',
    request: {
      params: z.object({
        loops: z.string().openapi({
          description: 'number of loops to run heavy task',
          example: '1',
        })
      }),
    },
    responses: {
      200: {
        description: 'Response when done',
        content: {
          'application/json': {
            schema: z.strictObject({
              loop: z.number(),
              startTime: z.string(),
              endTime: z.string(),
              blockedTime: z.number().openapi({
                description: 'blocked time(ms)',
              }),
            })
          }
        }
      }
    }
  }),
  (c) => {
    const result = highLoadTask(Number(c.req.param('loops')));
    return c.json(result)
  }
)

export default app
