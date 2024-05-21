<script lang="ts" context="module">
  import type { Disc } from "$lib/types"

  let audio = $state<HTMLAudioElement>()!

  let current: Disc | undefined = $state()
  let paused = $state(true)

  export async function play(disc: Disc) {
    if (current?.sound !== disc.sound) {
      if (audio.src) URL.revokeObjectURL(audio.src)
      current = disc
      audio.src = URL.createObjectURL(
        new Blob([disc.sound], { type: "audio/ogg" }),
      )
    }

    audio.play()
  }

  export function pause() {
    audio.pause()
  }

  export function isPlaying(disc: Disc) {
    return current?.sound === disc.sound && !paused
  }
</script>

<audio bind:this={audio} bind:paused></audio>
