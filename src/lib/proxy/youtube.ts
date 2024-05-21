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

  const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    body: JSON.stringify({
      videoId: id,
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: "18.11.34",
          androidSdkVersion: 30,
          hl: "en",
          timeZone: "UTC",
          utcOffsetMinutes: 0,
        },
      },
    }),
    headers: {
      "X-YouTube-Client-Name": "3",
      "X-YouTube-Client-Version": "18.11.34",
      Origin: "https://www.youtube.com",
      "User-Agent":
        "com.google.android.youtube/18.11.34 (Linux; U; Android 11) gzip",
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
