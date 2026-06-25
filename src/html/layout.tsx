import type Html from '@kitajs/html'
import { resolve } from 'node:path'
import { embed } from './embed'

export async function Layout(props?: Html.PropsWithChildren<{ title?: string }>) {
  const safeCss = await embed(resolve(import.meta.dirname, 'styles', 'main.css'))

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="preload"
          href="/fonts/Satoshi-Variable.woff2"
          as="font"
          type="font/woff2"
          crossorigin="anonymous"
        />
        <script src="/js/htmx.min.js"></script>
        <style type="text/css">{safeCss}</style>
        <title safe>{props?.title ?? 'telemetry • tf2pickup.org'}</title>
      </head>
      <body class="bg-abru text-abru-light-75 min-h-screen">{props?.children}</body>
    </html>
  )
}
