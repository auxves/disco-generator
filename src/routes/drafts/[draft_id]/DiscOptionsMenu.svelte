<script lang="ts">
  import { liveQuery } from "dexie"

  import { db } from "$lib/db"
  import type { Disc } from "$lib/types"

  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Command from "$lib/components/ui/command"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
  import { Label } from "$lib/components/ui/label"
  import { Input, FileInput } from "$lib/components/ui/input"

  import { confirm } from "$lib/components/Confirm.svelte"

  import { Ellipsis, LoaderCircle, Trash, Edit2, Move } from "lucide-svelte"

  type Props = {
    disc: Disc
  }

  const { disc }: Props = $props()

  const drafts = $derived(liveQuery(() => db.drafts.toArray()))

  let identifier = $state(disc.identifier)
  let name = $state(disc.name)
  let soundList = $state<FileList>()
  let textureList = $state<FileList>()

  const VALID_IDENTIFIER_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz_-."

  let loading = $state(false)
  let open = $state(false)

  async function create() {
    if (loading) return

    loading = true

    if (
      identifier.length < 1 ||
      [...identifier].some((c) => !VALID_IDENTIFIER_CHARS.includes(c))
    ) {
      return
    }

    if (name.length < 1) {
      return
    }

    if (!soundList || !soundList[0]) {
      return
    }

    if (!textureList || !textureList[0]) {
      return
    }

    db.discs
      .put({
        ...disc,
        identifier,
        name,
      })
      .catch((err) => {
        console.error(err)
        loading = false
      })
  }
</script>

{#snippet editContent()}
  <div class="grid w-full items-center gap-4">
    <div class="flex flex-col space-y-1.5 gap-1">
      <Label for="identifier">Identifier</Label>
      <Input
        id="identifier"
        placeholder="The identifier of the disc, unique to your addon"
        bind:value={identifier}
      />
    </div>
    <div class="flex flex-col space-y-1.5 gap-1">
      <Label for="name">Name</Label>
      <Input id="name" placeholder="Perhaps Artist - Song" bind:value={name} />
    </div>
    <div class="flex flex-col space-y-1.5 gap-1">
      <Label for="sound">Sound</Label>
      <FileInput
        id="sound"
        type="file"
        accept="audio/*"
        bind:files={soundList}
      />
    </div>
    <div class="flex flex-col space-y-1.5 gap-1">
      <Label for="texture">Texture</Label>
      <FileInput
        id="texture"
        type="file"
        accept="image/png"
        bind:files={textureList}
      />
    </div>
  </div>
{/snippet}

<Dialog.Root bind:open>
  <Dialog.Content class="rounded-lg max-w-[80%] md:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Edit disc</Dialog.Title>
      <Dialog.Description>
        If you upload new resources, which is optional, they will replace the
        old ones.
      </Dialog.Description>
    </Dialog.Header>
    {@render editContent()}
    <Dialog.Footer class="flex-col gap-2">
      <Button type="submit" onclick={create}>
        Save
        {#if loading}
          <LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class={buttonVariants({ variant: "ghost", size: "icon" })}
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
