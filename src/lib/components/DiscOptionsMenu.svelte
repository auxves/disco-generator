<script lang="ts">
  import { liveQuery } from "dexie"

  import { db } from "$lib/db"
  import type { Disc } from "$lib/types"

  import { buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Command from "$lib/components/ui/command"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"

  import { Ellipsis, Trash, Edit2, Move } from "lucide-svelte"

  import { confirm } from "$lib/components/Confirm.svelte"
  import DiscForm from "$lib/components/DiscForm.svelte"

  type Props = {
    disc: Disc
  }

  const { disc }: Props = $props()

  const drafts = $derived(liveQuery(() => db.drafts.toArray()))

  let open = $state(false)
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit disc</Dialog.Title>
      <Dialog.Description>
        If you upload new resources, which is optional, they will replace the
        old ones.
      </Dialog.Description>
    </Dialog.Header>
    <DiscForm
      owner={disc.draft}
      data={disc}
      onSubmit={(data) => {
        db.discs.update(disc.id, data)
        open = false
      }}
    />
  </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({
      variant: "ghost",
      size: "icon",
      class: "sm:ml-auto",
    })}
  >
    <Ellipsis class="size-4" />
    <span class="sr-only">More</span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item
      onclick={() => {
        open = !open
      }}
    >
      <Edit2 class="mr-2 h-4 w-4" />
      Edit
    </DropdownMenu.Item>

    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <Move class="mr-2 h-4 w-4" />
        Move to
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent class="p-0">
        <Command.Root>
          <Command.Input autofocus placeholder="Filter..." />
          <Command.List>
            <Command.Empty>No drafts found.</Command.Empty>
            <Command.Group>
              {#each $drafts || [] as draft}
                <Command.Item
                  value={String(draft.id)}
                  onSelect={(value) => {
                    db.discs.update(disc.id, { draft: +value })
                  }}
                >
                  {draft.namespace}
                </Command.Item>
              {/each}
            </Command.Group>
          </Command.List>
        </Command.Root>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="text-destructive"
      onclick={() => {
        confirm({
          description:
            "This disc and all resources associated with it will be permanently deleted.",
          action: "Delete",
          onConfirm() {
            db.discs.delete(disc.id)
          },
        })
      }}
    >
      <Trash class="mr-2 h-4 w-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
