import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchProxied } from "./utils"

type Resource = Blob | string

let ffmpeg: FFmpeg

async function init() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()

    ffmpeg.on("log", ({ message }) => console.log(message))

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"

    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    })
  }
}

export async function processAudio(file: Resource) {
  await init()

  const buf = await bufferOf(file)

  const input = "input-audio"
  await ffmpeg.writeFile(input, new Uint8Array(buf))
  const out = `${input}.out.ogg`

  let duration = 0

  const calcDuration = ({ message }: any) => {
    const match = message.match(/Duration: (\d{2}):(\d{2}):(\d{2})/)
    if (match) {
      const [, h, m, s] = match
      duration = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + 1
      ffmpeg.off("log", calcDuration)
    }
  }

  ffmpeg.on("log", calcDuration)

  // prettier-ignore
  await ffmpeg.exec([
    "-i", input,
    "-ac", "1", // mono audio
    "-map", "0:a:0", // remove metadata
    out,
  ])

  let sound = await ffmpeg.readFile(out)

  if (typeof sound === "string") {
    sound = new TextEncoder().encode(sound)
  }

  await ffmpeg.deleteFile(input)
  await ffmpeg.deleteFile(out)

  ffmpeg.off("log", calcDuration)

  return { sound: sound.buffer, duration }
}

export async function processImage(file: Resource) {
  const buf = await bufferOf(file)

  if (isPng(file)) return { texture: buf }

  await init()

  const input = "input-image"
  await ffmpeg.writeFile(input, new Uint8Array(buf))
  const out = `${input}.out.png`

  await ffmpeg.exec(["-i", input, out])

  let texture = await ffmpeg.readFile(out)

  if (typeof texture === "string") {
    texture = new TextEncoder().encode(texture)
  }

  await ffmpeg.deleteFile(input)
  await ffmpeg.deleteFile(out)

  return { texture: texture.buffer }
}

async function bufferOf(file: Resource) {
  if (typeof file === "string") {
    const res = file.startsWith("/")
      ? await fetch(file)
      : await fetchProxied(file)
    return res.arrayBuffer()
  } else {
    return file.arrayBuffer()
  }
}

function isPng(file: Resource) {
  if (typeof file === "string") return file.endsWith(".png")
  return file.type === "image/png"
}
