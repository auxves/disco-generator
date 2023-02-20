export type Disc = {
  id: string
  name: string
  texture: File | undefined
  sound: File | undefined
}

export type Draft = {
  id: string
  name: string
  description: string
  discs: Disc[]
}
