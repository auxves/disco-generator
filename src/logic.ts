import { downloadZip } from "client-zip"
import type { Disc } from "./types"

type GenerateOptions = {
  discs: Disc[]
  id: string
  name: string
  description: string
}

export async function generate(options: GenerateOptions) {
  const { discs, id, name, description } = options

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
          discs: discs.map((disc) => ({ id: disc.id, duration: 100 })),
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

  const sounds = discs.map((disc) => ({
    name: `assets/${id}/sounds/${disc.id}.ogg`,
    input: disc.sound,
  }))

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

  const blob = await downloadZip([
    fabricModJson,
    soundsJson,
    ...sounds,
    ...textures,
    ...models,
    translations,
  ]).blob()

  const link = document.createElement("a")
  const blobUrl = URL.createObjectURL(blob)
  link.href = blobUrl
  link.download = `${id}-1.0.0.jar`
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}
