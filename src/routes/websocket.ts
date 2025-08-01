import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono';
import { html } from 'hono/html'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["websocket"],
    method: 'get',
    path: '/',
    request: {
    },
    responses: {
      200: {
        description: 'websocket client page',
      }
    }
  }),
  (c) => {
  return c.html(html`
    <html>
      <head>
        <meta charset='UTF-8' />
      </head>
      <body>
        <button id='btn' disabled>Send data</button>
        <div id='resoponse'></div>
        <script>
          const $btn = document.getElementById('btn');
          const $resoponse = document.getElementById('resoponse');
          const ws = new WebSocket('ws://' +window.location.host + '/ws');
          ws.onmessage = (event) => {
            $resoponse.textContent = event.data
          }
          $btn.onclick = () => {
            ws.send('Hello from client!' + Date.now());
          }
          ws.onopen = () => {
            $resoponse.textContent = 'WebSocket connection established';
            $btn.disabled = false;
          }
          ws.onclose = () => {
            $resoponse.textContent = 'WebSocket connection closed';
            $btn.disabled = true;
          }
          ws.onerror = (error) => {
            $resoponse.textContent = 'WebSocket error: ' + error.message;
          }
        </script>
      </body>
    </html>
  `)
})


export default app
