import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { css, Style } from 'hono/css'
import type { FC } from 'hono/jsx'
import { prettyJSON } from 'hono/pretty-json'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { miscapi } from './routes/misc'

const app = new OpenAPIHono()
app.use('*', prettyJSON())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
app.get('/ui', swaggerUI({ url: '/doc' }))


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

app.get(
  '/ui',
  swaggerUI({
    url: '/doc'
  })
)

app.doc('/doc', {
  info: {
    title: 'An API',
    version: 'v1'
  },
  openapi: '3.1.0'
})


app.get('/', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})


app.route('/misc', miscapi)


const port: number = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
