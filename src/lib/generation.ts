import { downloadZip } from "client-zip"
import type { Draft } from "./types"

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
