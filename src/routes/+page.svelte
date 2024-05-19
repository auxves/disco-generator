<script lang="ts">
  import { liveQuery } from "dexie"

  import { db } from "$lib/db"
  import { goto } from "$app/navigation"
  import type { Draft } from "$lib/types"

  import { buttonVariants } from "$lib/components/ui/button"
  import * as Card from "$lib/components/ui/card"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"

  import { Circle, Ellipsis, Trash } from "lucide-svelte"

  import NewDraftDialog from "./NewDraftDialog.svelte"
  import { confirm } from "$lib/components/Confirm.svelte"

  const drafts = $derived(liveQuery(() => db.drafts.toArray()))

  function discCount(draft: Draft) {
    return db.discs.where("draft").equals(draft.id!).count()
  }
</script>

<div class="flex-1 space-y-4 p-12 pt-6 max-w-screen-lg w-full">
  <div class="flex items-center justify-between space-y-2">
    <h2 class="text-3xl font-bold tracking-tight">Drafts</h2>
    <div class="flex items-center space-x-2">
      <NewDraftDialog />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          id="more_options_dropdown"
          class={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <Ellipsis class="size-4" />
          <span class="sr-only">More</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            class="text-destructive"
            onclick={() => {
              confirm({
                description:
                  "This will permanently delete all drafts, including their associated discs.",
                action: "Delete",
                onConfirm() {
                  db.drafts.clear()
                  db.discs.clear()
                },
              })
            }}
          >
            <Trash class="mr-2 h-4 w-4" />
            Delete All
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each $drafts || [] as draft (draft.id)}
      <Card.Root
        class="grid content-between cursor-pointer"
        onclick={() => goto(`/drafts/${draft.id}`)}
      >
        <Card.Header>
          <Card.Title>{draft.name}</Card.Title>
          <Card.Description class="line-clamp-3">
            {draft.description}
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="flex space-x-4 text-sm text-muted-foreground">
            <div class="flex items-center">
              <Circle class="mr-1 h-3 w-3 outline-primary" />
              {#await discCount(draft) then count}
                {count} Disc{count === 1 ? "" : "s"}
              {/await}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  </section>
</div>
