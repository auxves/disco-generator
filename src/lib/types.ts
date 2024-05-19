export type Disc = {
  id?: number
  draft: number
  identifier: string
  name: string
  texture: ArrayBuffer
  sound: ArrayBuffer
  duration: number
}

export type Draft = {
  id?: number
  namespace: string
  name: string
  description: string
}
