import { downloadZip } from "client-zip"
import type { Disc, Draft, StoredFile } from "./types"

export async function generate(draft: Draft) {
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

function storeFile(file: File): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () =>
      resolve({
        name: file.name,
        type: file.type,
        url: reader.result as string,
      })

    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}

async function restoreFile(stored: StoredFile): Promise<File> {
  const response = await fetch(stored.url)
  const buffer = await response.arrayBuffer()
  return new File([buffer], stored.name, { type: stored.type })
}

export async function save(draft: Draft) {
  const discs = await Promise.all(
    draft.discs.map(async (disc) => ({
      ...disc,
      texture: await storeFile(disc.texture),
      sound: await storeFile(disc.sound),
    }))
  )

  const json = JSON.stringify({ ...draft, discs })

  localStorage.setItem(draft.id, json)
}

export async function load(id: string): Promise<Draft> {
  const x = JSON.parse(localStorage.getItem(id))

  const discs: Disc[] = await Promise.all(
    x.discs.map(async (disc) => ({
      ...disc,
      texture: await restoreFile(disc.texture),
      sound: await restoreFile(disc.sound),
    }))
  )

  return { ...x, discs }
}
