import * as youtube from "$lib/proxy/youtube"

export async function GET({ fetch, request, url }) {
  const targetString = url.searchParams.get("target")

  if (!targetString) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    })
  }

  const target = new URL(targetString)

  if (youtube.matches(target)) {
    return youtube.download(target, request)
  }

  return fetch(target, {
    headers: request.headers,
  })
}
