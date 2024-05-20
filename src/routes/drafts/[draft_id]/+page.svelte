<script lang="ts">
  import { liveQuery } from "dexie"

  import { page } from "$app/stores"
  import { db } from "$lib/db"
  import { generate } from "$lib/logic"
  import type { Disc } from "$lib/types"

  import { Button } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Card from "$lib/components/ui/card"

  import { Play, Pause, Download } from "lucide-svelte"

  import NewDiscDialog from "./NewDiscDialog.svelte"
  import DiscOptionsMenu from "./DiscOptionsMenu.svelte"
  import DraftOptionsMenu from "./DraftOptionsMenu.svelte"

  const { draft_id } = $page.params as import("./$types").RouteParams

  const draft = $derived(liveQuery(() => db.drafts.get(+draft_id)))

  const discs = $derived(
    liveQuery(() => db.discs.where("draft").equals(+draft_id).toArray()),
  )

  let audio = $state<HTMLAudioElement>()!

  let lastPlayedID = $state<number>()
  let playing = $state(false)

  function play(disc: Disc) {
    if (lastPlayedID !== disc.id) {
      if (audio.src) URL.revokeObjectURL(audio.src)
      lastPlayedID = disc.id
      audio.src = URL.createObjectURL(
        new Blob([disc.sound], { type: "audio/ogg" }),
      )
    }

    audio.play()
    playing = true
  }

  function pause() {
    audio.pause()
    playing = false
  }
</script>

<audio bind:this={audio}></audio>

{#if $draft}
  <div class="space-y-2 p-12 pt-6 max-w-screen-lg w-full">
    <div class="flex items-center gap-4">
      <h2 class="text-3xl font-bold tracking-tight">
        {$draft.name}
      </h2>
      <span class="flex-grow"></span>
      <div class="flex items-center gap-2">
        <Button onclick={() => generate($draft)}>
          <Download class="mr-2 h-4 w-4" />
          Download
        </Button>
        <DraftOptionsMenu draft={$draft} />
      </div>
    </div>
    <Badge class="font-mono" variant="secondary">
      {$draft.namespace}
    </Badge>
    <p>
      {$draft.description}
    </p>
  </div>

  <div class="flex-1 space-y-4 p-12 pt-0 max-w-screen-lg w-full">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold tracking-tight">Discs</h2>
      <div class="flex items-center gap-2">
        <NewDiscDialog draft={$draft} />
      </div>
    </div>

    <section class="grid grid-cols-1 gap-4">
      {#each $discs || [] as disc (disc.id)}
        <Card.Root>
          <Card.Header class="flex-row items-center space-y-0 gap-4">
            <img
              class="size-10"
              src={URL.createObjectURL(
                new Blob([disc.texture], { type: "image/png" }),
              )}
              alt="Texture"
            />
            {#if playing && lastPlayedID === disc.id}
              <Pause class="fill-primary cursor-pointer" onclick={pause} />
            {:else}
              <Play
                class="fill-primary cursor-pointer"
                onclick={() => play(disc)}
              />
            {/if}
            <Card.Title>{disc.name}</Card.Title>
            <Badge class="font-mono" variant="secondary">
              {disc.identifier}
            </Badge>
            <span class="flex-grow"></span>
            <DiscOptionsMenu {disc} />
          </Card.Header>
        </Card.Root>
      {/each}
    </section>
  </div>
{/if}
