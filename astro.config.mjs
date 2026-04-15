import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import node from '@astrojs/node'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  devToolbar: {
    enabled: false
  },
  integrations: [svelte(), tailwind({ applyBaseStyles: false })],
  output: 'server',
  vite: {
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, 'src/lib'),
        $layouts: path.resolve(__dirname, 'src/layouts')
      }
    },
    ssr: {
      noExternal: ['lucide-svelte', 'bits-ui', 'svelte']
    }
  }
})
