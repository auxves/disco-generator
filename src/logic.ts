import { downloadZip } from "client-zip"
import type { Disc, Draft, Resource } from "./types"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

const ffmpeg = new FFmpeg()

ffmpeg.on("log", ({ message }) => console.log(message))

export async function generate(draft: Draft) {
  if (!isDraftComplete(draft))
    throw new Error("draft is not complete: missing fields")

  const { id, name, description } = draft

  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm"

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  })

  type FinalDisc = {
    id: string
    name: string
    texture: Uint8Array
    sound: Uint8Array
    duration: number
  }

  const discs: FinalDisc[] = []

  for (const { id, name, texture, sound: origSound } of draft.discs) {
    const { sound, duration } = await convertSound(origSound!)

    discs.push({
      id,
      name,
      texture: await fetchFile(texture!),
      sound,
      duration,
    })
  }

  const fabricModJson = {
    name: "fabric.mod.json",
    input: JSON.stringify({
      schemaVersion: 1,
      id,
      name,
      description,
      version: "1.0.0",
      custom: {
        disco: {
          discs: discs.map((disc) => ({
            id: disc.id,
            duration: disc.duration,
          })),
        },
      },
    }),
  }

  const soundsJson = {
    name: `assets/${id}/sounds.json`,
    input: JSON.stringify(
      Object.fromEntries(
        discs.map((disc) => [
          disc.id,
          {
            category: "record",
            sounds: [{ name: `${id}:${disc.id}`, stream: true }],
          },
        ])
      )
    ),
  }

  const textures = discs.map((disc) => ({
    name: `assets/${id}/textures/item/${disc.id}.png`,
    input: disc.texture,
  }))

  const soundFiles = await Promise.all(
    discs.map(async (disc) => ({
      name: `assets/${id}/sounds/${disc.id}.ogg`,
      input: disc.sound,
    }))
  )

  const models = discs.map((disc) => ({
    name: `assets/${id}/models/item/${disc.id}.json`,
    input: JSON.stringify({
      parent: "item/generated",
      textures: {
        layer0: `${id}:item/${disc.id}`,
      },
    }),
  }))

  const translations = {
    name: `assets/${id}/lang/en_us.json`,
    input: JSON.stringify(
      Object.fromEntries(
        discs.map((disc) => [`item.${id}.${disc.id}.desc`, disc.name])
      )
    ),
  }

  const discsTag = {
    name: `data/${id}/tags/items/discs.json`,
    input: JSON.stringify({
      values: discs.map((disc) => ({
        id: `${id}:${disc.id}`,
        required: false,
      })),
    }),
  }

  const globalDiscsTag = {
    name: `data/minecraft/tags/items/music_discs.json`,
    input: JSON.stringify({
      values: [{ id: `#${id}:discs`, required: false }],
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
  link.download = `${id}.jar`
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}

export function isDraftComplete(draft: Draft) {
  return (
    draft.id !== "" && draft.name !== "" && draft.discs.every(isDiscComplete)
  )
}

export function isDiscComplete(disc: Disc) {
  return (
    disc.id !== "" &&
    disc.name !== "" &&
    disc.sound !== undefined &&
    disc.texture !== undefined
  )
}

export function getFilename(input: Resource) {
  if (input instanceof File) return input.name
  else return input.split("/").at(-1)!
}

async function convertSound(input: Resource) {
  const filename = getFilename(input)

  await ffmpeg.writeFile(filename, await fetchFile(input))

  let duration = 0

  const calcDuration = ({ message }: any) => {
    const match = message.match(/Duration: (\d{2}):(\d{2}):(\d{2})/)
    if (match) {
      const [, h, m, s] = match
      duration = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)
      ffmpeg.off("log", calcDuration)
    }
  }

  ffmpeg.on("log", calcDuration)

  await ffmpeg.exec(["-i", filename, "-ac", "1", `${filename}.out.ogg`])

  let sound = await ffmpeg.readFile(`${filename}.out.ogg`)

  if (typeof sound === "string") {
    sound = new TextEncoder().encode(sound)
  }

  await ffmpeg.deleteFile(filename)
  await ffmpeg.deleteFile(`${filename}.out.ogg`)

  ffmpeg.off("log", calcDuration)

  return { sound, duration }
}
