const allowedOrigins = [
  /^https:\/\/disco\.auxves\.dev$/,
  /^https:\/\/disco-generator-.+-auxves-projects\.vercel\.app$/,
]

function accessControlHeaders(request: Request, env: Env) {
  const origin = request.headers.get("origin") || "unknown"

  if (env.ENV === "dev") return { "Access-Control-Allow-Origin": "*" }
  if (allowedOrigins.some((r) => r.test(origin)))
    return { "Access-Control-Allow-Origin": origin }

  return { "Access-Control-Allow-Origin": "https://disco.auxves.dev" }
}

export function headersFor(request: Request, env: Env) {
  return {
    ...accessControlHeaders(request, env),
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}
