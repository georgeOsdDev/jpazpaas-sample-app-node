import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import { css, Style } from 'hono/css'
import type { FC } from 'hono/jsx'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { createNodeWebSocket } from '@hono/node-ws'
import routes from './routes/'

const app = new OpenAPIHono()
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
app.use('/static/*', serveStatic({ root: './' }))
app.use('*', poweredBy())
app.use('*', logger())

app.use(async (c, next) => {
  if (process.env.loghttpheader) {
    console.log("↓↓↓===Header Dump===↓↓↓")
    console.log(c.req.header())
    console.log("↑↑↑===Header Dump===↑↑↑")
  }
  await next()
})

// app.use('*', prettyJSON())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
app.get(
  '/ui',
  swaggerUI({
    url: '/doc'
  })
)

app.doc('/doc', {
  info: {
    title: 'My API',
    version: 'v1'
  },
  openapi: '3.1.0'
})

const Layout: FC = (props) => {
  const bodyClass = css`
  padding: 50px;
  font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;
`
  return (
    <html>
      <head>
        <title></title>
        <Style />
      </head>
      <body class={bodyClass}>{props.children}</body>
    </html>
  )
}
const Top: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <Layout>
      <h1>Hello App Service</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>
        })}
      </ul>
      <p> Check <a href="/ui">Swagger UI</a></p>
    </Layout>
  )
}

const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

app.get('/', async (c) => {
  // await wait(1000);
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})

let wsClientCount = 0;
app.get('/ws', upgradeWebSocket((c) => {
    wsClientCount++;
    console.log(`WebSocket client connected. Total clients: ${wsClientCount}`);

    return {
      onOpen: (event, ws) => {
        console.log('WebSocket connection opened');
        ws.send(`Welcome! You are connected to the WebSocket server.Total clients: ${wsClientCount}`);
      },
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        // Echo the message back with a server prefix
        ws.send(`Server received: ${event.data}`);
      },
      onClose: () => {
        wsClientCount--;
        console.log(`WebSocket client disconnected. Total clients: ${wsClientCount}`);
      },
      onError: (event, ws) => {
        console.log('WebSocket error:', event);
      }
    }
  })
)

app.route('/file', routes.file)
app.route('/ip', routes.ip)
app.route('/misc', routes.misc)
app.route('/request', routes.request)
app.route('/env', routes.env)
app.route('/httpstatus', routes.httpstatus)
app.route('/cookie', routes.cookie)
app.route('/proxy', routes.proxy)
app.route('/bench', routes.bench)
app.route('/stream', routes.stream)
app.route('/healthcheck', routes.healthcheck)
app.route('/redirect', routes.redirect)
app.route('/websocket', routes.websocket)
console.log("routes", Object.keys(routes))


const port: number = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`)

const server = serve({
  fetch: app.fetch,
  port,
})
injectWebSocket(server)
