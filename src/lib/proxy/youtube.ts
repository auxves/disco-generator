const hosts = [
  "music.youtube.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
]

function getFormat(data: any) {
  return data.streamingData.adaptiveFormats.find(
    (format: any) => format.audioQuality === "AUDIO_QUALITY_MEDIUM",
  )
}

export function matches(url: URL) {
  return hosts.includes(url.host)
}

export async function download(target: URL, request: Request) {
  const id = target.searchParams.get("v") || target.pathname.slice(1)

  if (!id) {
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
    })
  }

  // https://github.com/hi-ogawa/youtube-dl-web-v2/raw/aba63b192ab7eef362aa93d0b98a6cf539284f5a/packages/app/src/utils/youtube-utils.ts
  const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    body: JSON.stringify({
      videoId: id,
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: "19.44.38",
          androidSdkVersion: 30,
          userAgent:
            "com.google.android.youtube/19.44.38 (Linux; U; Android 11) gzip",
          osName: "Android",
          osVersion: "11",
          hl: "en",
          timeZone: "UTC",
          utcOffsetMinutes: 0,
        },
      },
    }),
    headers: {
      "X-YouTube-Client-Name": "ANDROID",
      "X-YouTube-Client-Version": "19.44.38",
      Origin: "https://www.youtube.com",
      "User-Agent":
        "com.google.android.youtube/19.44.38 (Linux; U; Android 11) gzip",
      "content-type": "application/json",
    },
  })

  const data = await res.json()

  const format = getFormat(data)

  if (!format) {
    return new Response(null, {
      status: 404,
      statusText: "No Stream Found",
    })
  }

  return fetch(format.url, {
    headers: {
      range: `bytes=0-${format.contentLength}`,
    },
  })
}
