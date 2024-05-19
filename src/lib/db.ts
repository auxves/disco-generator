import Dexie, { type Table } from "dexie"

import type { Disc, Draft } from "$lib/types"

export class DB extends Dexie {
  discs!: Table<Disc>
  drafts!: Table<Draft>

  constructor() {
    super("disco-generator")
    this.version(3).stores({
      discs: "++id, identifier, draft",
      drafts: "++id, namespace",
    })
  }
}

export const db = new DB()
