<script lang="ts">
  import { db } from "$lib/db"
  import { convertSound } from "$lib/logic"
  import type { Draft, Disc } from "$lib/types"

  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Label } from "$lib/components/ui/label"
  import { Input, FileInput } from "$lib/components/ui/input"

  import { Ellipsis, LoaderCircle, Plus } from "lucide-svelte"

  type Props = {
    draft: Draft
    disc?: Disc
  }

  const { draft, disc }: Props = $props()

  let identifier = $state(disc ? disc.identifier : "")
  let name = $state(disc ? disc.name : "")
  let soundList = $state<FileList>()
  let textureList = $state<FileList>()

  const VALID_IDENTIFIER_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz_-."

  let loading = $state(false)

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
        identifier,
        name,
        texture: await textureList[0].arrayBuffer(),
        draft: draft.id!,
        ...(await convertSound(soundList[0])),
      })
      .catch((err) => {
        console.error(err)
        loading = false
      })
  }
</script>

<Dialog.Root>
  {#if disc}
    <Dialog.Trigger class={buttonVariants({ variant: "ghost", size: "icon" })}>
      <Ellipsis class="size-4" />
    </Dialog.Trigger>
  {:else}
    <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
      <Plus class="mr-2 h-4 w-4" />
      Add
    </Dialog.Trigger>
  {/if}

  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Create a new disc</Dialog.Title>
      <Dialog.Description>
        Fill out the information for your disc and upload the necessary
        resources.
      </Dialog.Description>
    </Dialog.Header>
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
        <Input
          id="name"
          placeholder="Perhaps Artist - Song"
          bind:value={name}
        />
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
    <Dialog.Footer>
      <Button type="submit" onclick={create}>
        Create
        {#if loading}
          <LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
