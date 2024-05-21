import * as youtube from "./youtube"

export function headersForEnv(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.ENV === "dev" ? "*" : "disco.auxves.dev",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
  }
}

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
    return youtube.handleDownload(targetURL, env)
  }

  const res = await fetch(targetURL, {
    headers: request.headers,
  })

  return new Response(res.body, {
    ...res,
    headers: {
      ...res.headers,
      ...headersForEnv(env),
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
        ...headersForEnv(env),
      },
    })
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, OPTIONS",
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
    } else if (request.method === "GET") {
      return handleRequest(request, env)
    } else {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      })
    }
  },
}
