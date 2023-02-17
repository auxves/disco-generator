export type Disc = {
  id: string
  name: string
  texture?: File
  sound?: File
}

export type Draft = {
  discs: Disc[]
  id: string
  name: string
  description: string
}

export type StoredFile = {
  name: string
  url: string
  type: string
}
