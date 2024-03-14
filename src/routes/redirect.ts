import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    tags: ["redirect"],
    method: 'get',
    path: '/example301',
    request: {
    },
    responses: {
      301: {
        description: '301 to example.com',
      }
    }
  }),
  (c) => {
    return c.redirect('https://example.com', 301);
  }
)
app.openapi(
  createRoute({
    tags: ["redirect"],
    method: 'get',
    path: '/example302',
    request: {
    },
    responses: {
      302: {
        description: '301 to example.com',
      }
    }
  }),
  (c) => {
    return c.redirect('https://example.com', 302);
  }
)
app.openapi(
  createRoute({
    tags: ["redirect"],
    method: 'get',
    path: '/301',
    request: {
    },
    responses: {
      301: {
        description: '301 response',
      }
    }
  }),
  (c) => {
    return c.redirect('/', 301);
  }
)
app.openapi(
  createRoute({
    tags: ["redirect"],
    method: 'get',
    path: '/302',
    request: {
    },
    responses: {
      302: {
        description: '302 response',
      }
    }
  }),
  (c) => {
    return c.redirect('/', 302);
  }
)

export default app
