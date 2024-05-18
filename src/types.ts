export type Resource = File | string

export type Disc = {
  id: string
  name: string
  texture: Resource | undefined
  sound: Resource | undefined
}

export type Draft = {
  id: string
  name: string
  description: string
  discs: Disc[]
}
