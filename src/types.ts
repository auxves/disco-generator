export type Disc = {
  id: string
  name: string
  texture: File | undefined
  sound: File | undefined
}

export type SerializedDisc = {
  id: string
  name: string
  texture: SerializedFile | undefined
  sound: SerializedFile | undefined
}

export type Draft = {
  id: string
  name: string
  description: string
  discs: Disc[]
}

export type SerializedDraft = {
  id: string
  name: string
  description: string
  discs: SerializedDisc[]
}

export type SerializedFile = {
  name: string
  url: string
  type: string
}
