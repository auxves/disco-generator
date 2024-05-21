import * as youtube from "./youtube"
import { headersFor } from "./utils"

async function handleDownload(request: Request, env: Env) {
  const url = new URL(request.url)

  const target = url.searchParams.get("target")

  if (!target) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    })
  }

  const targetURL = new URL(target)

  if (youtube.hosts.includes(targetURL.host)) {
    return youtube.handleDownload(targetURL, request, env)
  }

  const res = await fetch(targetURL, {
    headers: request.headers,
  })

  return new Response(res.body, {
    ...res,
    headers: {
      ...res.headers,
      ...headersFor(request, env),
    },
  })
}

async function handleRequest(request: Request, env: Env) {
  const url = new URL(request.url)

  if (url.pathname === "/download") {
    return handleDownload(request, env)
  } else {
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
    })
  }
}

async function handleOptions(request: Request, env: Env) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers",
        )!,
        ...headersFor(request, env),
      },
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions(request, env)
    } else if (request.method === "GET" || request.method === "POST") {
      return handleRequest(request, env)
    } else {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
    }
  },
}
