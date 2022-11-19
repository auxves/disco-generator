<script lang="ts">
  import DiscEntry from "./lib/DiscEntry.svelte"
  import type { Disc } from "./types"
  import { downloadZip } from "client-zip"

  let name = ""
  let id = ""
  let description = ""

  let discs: Disc[] = []

  async function download() {
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

  function addNew() {
    discs = [...discs, { id: "", name: "" }]
  }

  function remove(index: number) {
    discs.splice(index, 1)
    discs = discs
  }
</script>

<main>
  <h1>Disco Generator</h1>

  <div class="input-group">
    <label for="name">Name</label>
    <input
      id="name"
      type="text"
      placeholder="What will you call your addon?"
      bind:value={name}
    />
  </div>

  <div class="input-group">
    <label for="identifier">Identifier</label>
    <input
      id="identifier"
      type="text"
      placeholder="Give it a unique identifier (this will be the file name)"
      bind:value={id}
    />
  </div>

  <div class="input-group">
    <label for="description">Description</label>
    <input
      id="description"
      type="text"
      placeholder="Write a description for your addon"
      bind:value={description}
    />
  </div>

  <h2>Discs</h2>

  {#each discs as disc, i}
    <DiscEntry bind:disc remove={() => remove(i)} />
  {/each}

  <button on:click={addNew}>Add New</button>
  <button on:click={download}>Download</button>
</main>

<style>
  main {
    display: grid;
    gap: 1.5rem;
  }
</style>
