<script lang="ts">
  import type { Disc } from "$lib/types"

  import * as Card from "$lib/components/ui/card"
  import { Badge } from "$lib/components/ui/badge"

  import DiscOptionsMenu from "$lib/components/DiscOptionsMenu.svelte"
  import { play, pause, isPlaying } from "$lib/components/AudioPlayer.svelte"

  import { Play, Pause } from "lucide-svelte"

  type Props = {
    disc: Disc
  }

  const { disc }: Props = $props()

  const image = $derived(
    URL.createObjectURL(new Blob([disc.texture], { type: "image/png" })),
  )

  $effect(() => () => {
    URL.revokeObjectURL(image)
  })
</script>

<Card.Root>
  <Card.Header class="sm:flex-row items-center space-y-0 gap-4">
    <img class="size-10" src={image} alt="Texture" />
    {#if isPlaying(disc)}
      <Pause class="fill-primary cursor-pointer" onclick={pause} />
    {:else}
      <Play class="fill-primary cursor-pointer" onclick={() => play(disc)} />
    {/if}
    <Card.Title class="font-medium">{disc.name}</Card.Title>
    <Badge class="font-mono" variant="secondary">
      {disc.identifier}
    </Badge>
    <DiscOptionsMenu {disc} />
  </Card.Header>
</Card.Root>

<style>
  img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
</style>
