<script lang="ts">
  import DiscEntry from "./lib/DiscEntry.svelte"
  import DraftsMenu from "./lib/DraftsMenu.svelte"
  import { generate, save } from "./logic"
  import type { Disc, Draft } from "./types"

  let name = ""
  let id = ""
  let description = ""

  let discs: Disc[] = []

  function download() {
    generate({
      discs,
      id,
      name,
      description,
    }).catch((err: ErrorEvent) => {
      console.log(err)
    })
  }

  function saveDraft() {
    if (id === "" || name === "") return

    save({
      discs,
      id,
      name,
      description,
    })
  }

  function loadDraft(event: CustomEvent<Draft>) {
    ;({ id, name, description, discs } = event.detail)
  }

  function newDisc() {
    discs = [...discs, { id: "", name: "" }]
  }

  function remove(index: number) {
    discs.splice(index, 1)
    discs = discs
  }
</script>

<main>
  <header>
    <h1>Disco Generator</h1>
    <DraftsMenu on:load={loadDraft} />
  </header>

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
    <label for="identifier">Identifier</label>
    <input
      id="identifier"
      type="text"
      placeholder="Give it a unique identifier (this will be the file name)"
      bind:value={id}
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

  {#each discs as disc, i (disc)}
    <DiscEntry bind:disc on:remove={() => remove(i)} />
  {/each}

  <button id="new-disc" on:click={newDisc}>New Disc</button>

  <div id="buttons">
    <button id="save-draft" on:click={saveDraft}>Save Draft</button>
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
