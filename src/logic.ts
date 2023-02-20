import { downloadZip } from "client-zip"
import type {
  Disc,
  Draft,
  SerializedDisc,
  SerializedDraft,
  SerializedFile,
} from "./types"

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
  link.download = `${id}.jar`
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}

function serializeFile(file: File): Promise<SerializedFile> {
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

async function restoreFile(stored: SerializedFile): Promise<File> {
  const response = await fetch(stored.url)
  const buffer = await response.arrayBuffer()
  return new File([buffer], stored.name, { type: stored.type })
}

export async function save(draft: Draft): Promise<SerializedDraft> {
  if (draft.id === "") throw new Error("invalid draft")

  const discs = await Promise.all(
    draft.discs.map(async (disc) => {
      return {
        ...disc,
        texture: disc.texture && (await serializeFile(disc.texture)),
        sound: disc.sound && (await serializeFile(disc.sound)),
      } as SerializedDisc
    })
  )

  let serialized = { ...draft, discs }

  const json = JSON.stringify(serialized)
  localStorage.setItem(draft.id, json)

  return serialized
}

export async function load(id: string): Promise<Draft> {
  const json = localStorage.getItem(id)
  if (json === null) throw new Error(`draft '${id}' does not exist`)

  const draft: SerializedDraft = JSON.parse(json)

  const discs: Disc[] = await Promise.all(
    draft.discs.map(async (disc) => ({
      ...disc,
      texture: disc.texture && (await restoreFile(disc.texture)),
      sound: disc.sound && (await restoreFile(disc.sound)),
    }))
  )

  return { ...draft, discs }
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
