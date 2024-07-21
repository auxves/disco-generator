import JSZip from "jszip"
import type { Draft } from "./types"

import { db } from "./db"

export async function generate(draft: Draft) {
  const discs = await db.discs.where("draft").equals(draft.id!).toArray()

  const { namespace, name, description } = draft

  const zip = new JSZip()

  zip.file(
    "fabric.mod.json",
    JSON.stringify({
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
  )

  zip.file(
    `assets/${namespace}/sounds.json`,
    JSON.stringify(
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
  )

  for (const disc of discs) {
    zip.file(
      `assets/${namespace}/textures/item/${disc.identifier}.png`,
      disc.texture,
    )

    zip.file(`assets/${namespace}/sounds/${disc.identifier}.ogg`, disc.sound)

    zip.file(
      `assets/${namespace}/models/item/${disc.identifier}.json`,
      JSON.stringify({
        parent: "item/generated",
        textures: {
          layer0: `${namespace}:item/${disc.identifier}`,
        },
      }),
    )
  }

  zip.file(
    `assets/${namespace}/lang/en_us.json`,
    JSON.stringify(
      Object.fromEntries(
        discs.map((disc) => [
          `item.${namespace}.${disc.identifier}.desc`,
          disc.name,
        ]),
      ),
    ),
  )

  zip.file(
    `data/${namespace}/tags/items/discs.json`,
    JSON.stringify({
      values: discs.map((disc) => ({
        id: `${namespace}:${disc.identifier}`,
        required: false,
      })),
    }),
  )

  zip.file(
    `data/minecraft/tags/items/music_discs.json`,
    JSON.stringify({
      values: [{ id: `#${namespace}:discs`, required: false }],
    }),
  )

  zip.file(
    "META-INF/MANIFEST.MF",
    `Manifest-Version: 1.0\nFabric-Loom-Mixin-Remap-Type: mixin`,
  )

  const blob = await zip.generateAsync({ compression: "DEFLATE", type: "blob" })

  const link = document.createElement("a")
  const blobUrl = URL.createObjectURL(blob)
  link.href = blobUrl
  link.download = `${namespace}.jar`
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}
