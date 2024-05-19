<script lang="ts">
  import { liveQuery } from "dexie"

  import { page } from "$app/stores"
  import { goto } from "$app/navigation"
  import { db } from "$lib/db"
  import { generate } from "$lib/logic"
  import type { Disc } from "$lib/types"

  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Separator } from "$lib/components/ui/separator"
  import * as Card from "$lib/components/ui/card"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"

  import { Ellipsis, Play, Pause, Download, Trash } from "lucide-svelte"

  import { confirm } from "$lib/components/Confirm.svelte"
  import NewDiscDialog from "./NewDiscDialog.svelte"
  import DiscOptionsMenu from "./DiscOptionsMenu.svelte"

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
  <div class="flex-1 space-y-4 p-12 pt-6 max-w-screen-lg w-full">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">{$draft.name}</h2>
      <div class="flex items-center space-x-2">
        <Button size="sm" onclick={() => generate($draft)}>
          <Download class="mr-2 h-4 w-4" />
          Download
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            id="draft-options"
            class={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <Ellipsis class="size-4" />
            <span class="sr-only">More</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              class="text-destructive"
              onclick={() => confirm({
                description: "This draft and all discs associated with it will be permanently deleted.",
                action: "Delete",
                onConfirm() {
                  db.discs.where("draft").equals($draft.id!).delete()
                  db.drafts.delete($draft.id!)
                  goto("/")
                },
              })}
            >
              <Trash class="mr-2 h-4 w-4" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  </div>

  <div class="flex-1 space-y-4 p-12 pt-6 max-w-screen-lg w-full">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight">Discs</h2>
      <div class="flex items-center space-x-2">
        <NewDiscDialog draft={$draft} />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            id="discs-options"
            class={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <Ellipsis class="size-4" />
            <span class="sr-only">More</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item
              class="text-destructive"
              onclick={() => confirm({
                description: "All discs associated with this draft will be permanently deleted.",
                action: "Delete",
                onConfirm() {
                  db.discs.where("draft").equals($draft.id!).delete()
                },
              })}
            >
              <Trash class="mr-2 h-4 w-4" />
              Delete All
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
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
            <Card.Title class="flex-grow">{disc.name}</Card.Title>
            <Separator class="invisible w-auto" />
            <DiscOptionsMenu {disc} />
          </Card.Header>
        </Card.Root>
      {/each}
    </section>
  </div>
{/if}
