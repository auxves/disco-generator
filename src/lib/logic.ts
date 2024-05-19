import { downloadZip } from "client-zip"
import type { Draft } from "./types"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { db } from "./db"

export async function generate(draft: Draft) {
  const discs = await db.discs.where("draft").equals(draft.id!).toArray()

  const { namespace, name, description } = draft

  const fabricModJson = {
    name: "fabric.mod.json",
    input: JSON.stringify({
      schemaVersion: 1,
      id: namespace,
      name,
      description,
      version: "1.0.0",
      custom: {
        disco: {
          discs: discs.map((disc) => ({
            id: disc.identifier,
            duration: disc.duration,
          })),
        },
      },
    }),
  }

  const soundsJson = {
    name: `assets/${namespace}/sounds.json`,
    input: JSON.stringify(
      Object.fromEntries(
        discs.map((disc) => [
          disc.identifier,
          {
            category: "record",
            sounds: [{ name: `${namespace}:${disc.identifier}`, stream: true }],
          },
        ]),
      ),
    ),
  }

  const textures = discs.map((disc) => ({
    name: `assets/${namespace}/textures/item/${disc.identifier}.png`,
    input: disc.texture,
  }))

  const soundFiles = discs.map((disc) => ({
    name: `assets/${namespace}/sounds/${disc.identifier}.ogg`,
    input: disc.sound,
  }))

  const models = discs.map((disc) => ({
    name: `assets/${namespace}/models/item/${disc.identifier}.json`,
    input: JSON.stringify({
      parent: "item/generated",
      textures: {
        layer0: `${namespace}:item/${disc.identifier}`,
      },
    }),
  }))

  const translations = {
    name: `assets/${namespace}/lang/en_us.json`,
    input: JSON.stringify(
      Object.fromEntries(
        discs.map((disc) => [
          `item.${namespace}.${disc.identifier}.desc`,
          disc.name,
        ]),
      ),
    ),
  }

  const discsTag = {
    name: `data/${namespace}/tags/items/discs.json`,
    input: JSON.stringify({
      values: discs.map((disc) => ({
        id: `${namespace}:${disc.identifier}`,
        required: false,
      })),
    }),
  }

  const globalDiscsTag = {
    name: `data/minecraft/tags/items/music_discs.json`,
    input: JSON.stringify({
      values: [{ id: `#${namespace}:discs`, required: false }],
    }),
  }

  const manifest = {
    name: `META-INF/MANIFEST.MF`,
    input: `Manifest-Version: 1.0\nFabric-Loom-Mixin-Remap-Type: mixin`,
  }

  const blob = await downloadZip([
    fabricModJson,
    soundsJson,
    ...soundFiles,
    ...textures,
    ...models,
    translations,
    discsTag,
    globalDiscsTag,
    manifest,
  ]).blob()

  const link = document.createElement("a")
  const blobUrl = URL.createObjectURL(blob)
  link.href = blobUrl
  link.download = `${namespace}.jar`
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}

let ffmpeg: FFmpeg

async function toBlobURL(url: string, mimeType: string) {
  const buf = await (await fetch(url)).arrayBuffer()
  const blob = new Blob([buf], { type: mimeType })
  return URL.createObjectURL(blob)
}

export async function convertSound(input: File) {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()

    ffmpeg.on("log", ({ message }) => console.log(message))

    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm"

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript",
      ),
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

  await ffmpeg.exec([
    "-i",
    filename,
    "-ac", // mono audio
    "1",
    "-map", // remove metadata
    "0:a:0",
    "-b:a", // 32k bitrate
    "32k",
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
