import { ClientType, Innertube, Platform, type Types } from "youtubei.js"

Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>,
) => {
  const properties = []

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`

  return new Function(code)()
}

const hosts = [
  "music.youtube.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
]

export function matches(url: URL) {
  return hosts.includes(url.host)
}

export async function download(target: URL) {
  const id = target.searchParams.get("v") || target.pathname.slice(1)

  if (!id) {
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
    })
  }

  const innertube = await Innertube.create({
    client_type: ClientType.MWEB,
  })

  const stream = await innertube.download(id, {
    type: "audio",
  })

  return new Response(stream)
}
