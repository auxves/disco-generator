import { FFmpeg } from "@ffmpeg/ffmpeg"

let ffmpeg: FFmpeg

import CORE_URL from "@ffmpeg/core?url"
import WASM_URL from "@ffmpeg/core/wasm?url"

export async function processAudio(input: File) {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()

    ffmpeg.on("log", ({ message }) => console.log(message))

    await ffmpeg.load({
      coreURL: CORE_URL,
      wasmURL: WASM_URL,
    })
  }

  const filename = input.name

  await ffmpeg.writeFile(filename, new Uint8Array(await input.arrayBuffer()))

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
    "-i", filename,
    "-ac", "1", // mono audio
    "-map", "0:a:0", // remove metadata
    `${filename}.out.ogg`,
  ])

  let sound = await ffmpeg.readFile(`${filename}.out.ogg`)

  if (typeof sound === "string") {
    sound = new TextEncoder().encode(sound)
  }

  await ffmpeg.deleteFile(filename)
  await ffmpeg.deleteFile(`${filename}.out.ogg`)

  ffmpeg.off("log", calcDuration)

  return { sound: sound.buffer, duration }
}
