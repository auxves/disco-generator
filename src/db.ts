import type { Draft } from "./types"

export class DB {
  constructor(private db: IDBDatabase) {}

  async get(id: string): Promise<Draft> {
    return new Promise((resolve, reject) => {
      const store = this.db
        .transaction(["drafts"], "readonly")
        .objectStore("drafts")

      const request = store.get(id)
      request.onsuccess = (s: any) => resolve(s.target.result)
      request.onerror = reject
    })
  }

  async getAll(): Promise<Draft[]> {
    return new Promise((resolve, reject) => {
      const store = this.db
        .transaction(["drafts"], "readonly")
        .objectStore("drafts")

      const request = store.getAll()
      request.onsuccess = (s: any) => resolve(s.target.result)
      request.onerror = reject
    })
  }

  async put(draft: Draft) {
    if (draft.id === "") throw new Error("invalid draft")

    const store = this.db
      .transaction(["drafts"], "readwrite")
      .objectStore("drafts")

    store.put(draft)
  }

  async delete(id: string) {
    const store = this.db
      .transaction(["drafts"], "readwrite")
      .objectStore("drafts")

    store.delete(id)
  }
}

export function connect(): Promise<DB> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DiscoGenerator", 2)

    request.onsuccess = (e: any) => resolve(new DB(e.target.result))
    request.onerror = reject

    request.onupgradeneeded = (e: any) => {
      const db: IDBDatabase = e.target.result
      console.log(db)
      db.createObjectStore("drafts", { keyPath: "id" })
    }
  })
}
