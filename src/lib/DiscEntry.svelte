<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import type { Disc } from "../types"

  const dispatch = createEventDispatcher()

  export let disc: Disc
</script>

<main>
  <button class="remove-button" on:click={() => dispatch("remove")}>✕</button>

  <div>
    <label for="">Identifier</label>
    <input
      type="text"
      placeholder="Make sure this is unique"
      bind:value={disc.id}
    />
  </div>

  <div>
    <label for="">Name</label>
    <input type="text" placeholder="Artist - Song" bind:value={disc.name} />
  </div>

  <div>
    <label for="">Sound</label>
    <input
      type="file"
      accept=".ogg, audio/ogg"
      on:change={(event) => (disc.sound = event.currentTarget.files[0])}
    />
  </div>

  <div>
    <label for="">Texture</label>
    <input
      type="file"
      accept="image/png"
      on:change={(event) => (disc.texture = event.currentTarget.files[0])}
    />
  </div>
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 1rem;
    position: relative;
    padding-left: 3rem;

    @media (min-width: 900px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .remove-button {
    display: grid;
    align-items: center;
    justify-content: center;

    background-color: hsl(0, 50%, 70%);
    color: black;

    width: 32px;
    height: 100%;
    border-radius: 8px;
    position: absolute;

    transition: background-color 0.2s;

    &:hover {
      background-color: hsl(0, 30%, 55%);
    }
  }
</style>
