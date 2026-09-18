import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

// In production /api/property is a Vercel serverless function. In development
// there is no serverless runtime, so mount the same handler on the dev server
// and get identical behaviour locally.
function propertyApi(): Plugin {
  return {
    name: 'buynidify-property-api',
    configureServer(server) {
      server.middlewares.use('/api/property', async (req, res) => {
        const target = new URL(req.url ?? '', 'http://localhost').searchParams.get('url')
        res.setHeader('content-type', 'application/json')
        if (!target) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Missing url parameter.' }))
          return
        }
        try {
          const { scrapeProperty } = await server.ssrLoadModule('/api/property.ts')
          res.end(JSON.stringify(await scrapeProperty(target, new URL(req.url ?? '', 'http://localhost').searchParams.has('debug'))))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: (error as Error).message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), propertyApi()],
})
