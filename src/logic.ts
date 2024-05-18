import { downloadZip } from "client-zip"
import type { Disc, Draft } from "./types"

export async function generate(draft: Draft) {
  if (!isDraftComplete(draft))
    throw new Error("draft is not complete: missing fields")

  const { discs, id, name, description } = draft

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
    ...sounds,
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
