<script lang="ts">
  import { onMount } from "svelte"
  import DiscEntry from "./lib/DiscEntry.svelte"
  import DraftsMenu from "./lib/DraftsMenu.svelte"
  import { generate } from "./logic"
  import { connect, type DB } from "./db"
  import type { Disc, Draft } from "./types"

  let db: DB

  let name = ""
  let id = ""
  let description = ""
  let discs: Disc[] = []

  let just_saved = false

  $: saveMessage = just_saved ? "Saved Draft ✔" : "Save Draft"

  function saveDraft() {
    const draft = {
      discs,
      id,
      name,
      description,
    } as Draft

    db.put(draft)
      .then(() => {
        just_saved = true
        setTimeout(() => {
          just_saved = false
        }, 3000)
      })
      .catch(alert)
  }

  function download() {
    generate({
      discs,
      id,
      name,
      description,
    }).catch(alert)
  }

  let drafts: Draft[] = []

  onMount(async () => {
    db = await connect()
    drafts = await db.getAll()
  })

  function newDisc() {
    discs.push({ id: "", name: "", sound: undefined, texture: undefined })
    discs = discs
  }

  function remove(index: number) {
    discs.splice(index, 1)
    discs = discs
  }
</script>

<main>
  <header>
    <h1>Disco Generator</h1>
    <DraftsMenu
      bind:drafts
      on:load={(event) => {
        ;({ id, name, description, discs } = structuredClone(event.detail))
      }}
      on:remove={async (event) => {
        const i = event.detail

        await db.delete(drafts[i].id)

        drafts.splice(i, 1)
        drafts = drafts
      }}
    />
  </header>

  <div>
    <label for="identifier">Identifier</label>
    <input
      id="identifier"
      type="text"
      placeholder="Give it a unique identifier (this will be the file name)"
      bind:value={id}
    />
  </div>

  <div>
    <label for="name">Name</label>
    <input
      id="name"
      type="text"
      placeholder="What will you call your addon?"
      bind:value={name}
    />
  </div>

  <div>
    <label for="description">Description</label>
    <input
      id="description"
      type="text"
      placeholder="Write a description for your addon"
      bind:value={description}
    />
  </div>

  <h2>Discs</h2>

  <!-- prettier-ignore -->
  <div class="info">
    Sounds must be .ogg files with one audio channel (mono).
    Click <a href="https://convertio.co/mp3-ogg" target="_blank" rel="noreferrer">here</a>
    for a tool to convert your sounds to the proper format.
  </div>

  <!-- prettier-ignore -->
  <div class="info">
    Once attached, sounds and textures must not be moved from their
    locations. Otherwise, you will have to re-select them.
  </div>

  {#each discs as disc, i (disc)}
    <DiscEntry bind:disc on:remove={() => remove(i)} />
  {/each}

  <button id="new-disc" on:click={newDisc}>New Disc</button>

  <div id="buttons">
    <button id="save-draft" on:click={saveDraft}>{saveMessage}</button>
    <button on:click={download}>Download</button>
  </div>
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 1.5rem;
  }

  header {
    display: grid;
    gap: 1rem;
  }

  h1 {
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1.1;
    margin: 0;
  }

  h2 {
    font-size: 2rem;
    margin: 0;
  }

  #buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  #new-disc {
    background-color: hsl(100, 75%, 85%);

    &:hover {
      background-color: hsl(100, 25%, 65%);
    }
  }

  #save-draft {
    background-color: hsl(66, 100%, 90%);

    &:hover {
      background-color: hsl(66, 30%, 75%);
    }
  }
</style>
