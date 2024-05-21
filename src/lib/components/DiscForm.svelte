<script lang="ts">
  import { z } from "zod"
  import { defaults, fileProxy, superForm } from "sveltekit-superforms"
  import { zod, zodClient } from "sveltekit-superforms/adapters"

  import type { Disc } from "$lib/types"
  import { processAudio, processImage } from "$lib/ffmpeg"

  import * as Form from "$lib/components/ui/form"
  import * as Tabs from "$lib/components/ui/tabs"
  import { Input, FileInput } from "$lib/components/ui/input"

  import { LoaderCircle } from "lucide-svelte"

  type Props = {
    owner: number
    data?: Disc
    onSubmit: (data: Disc) => any
  }

  const { data, owner, onSubmit }: Props = $props()

  const soundSchema = z
    .instanceof(File, { message: "Sound is required." })
    .or(z.string().url())

  const textureSchema = z
    .instanceof(File, { message: "Texture is required." })
    .or(z.string().url())

  const schema = z.object({
    identifier: z
      .string({ required_error: "Identifier is required." })
      .min(1, "Identifier must be at least one character long.")
      .regex(
        /^[a-z0-9-_]*$/,
        "Identifier can only contain lowercase letters, numbers, dashes, and underscores.",
      ),

    name: z
      .string({ required_error: "Name is required." })
      .min(1, "Name must be at least one character long."),

    sound: data ? soundSchema.optional() : soundSchema,
    texture: data ? textureSchema.optional() : textureSchema,
  })

  let loading = $state(false)

  const form = superForm(
    defaults({ identifier: data?.identifier, name: data?.name }, zod(schema)),
    {
      SPA: true,
      validators: zodClient(schema),
      async onUpdate({ form }) {
        if (form.valid) {
          loading = true

          let { identifier, name, sound, texture } = form.data

          if (data) {
            onSubmit({
              ...data,
              identifier,
              name,
              ...(sound ? await processAudio(sound) : {}),
              ...(texture ? await processImage(texture) : {}),
            })
          } else {
            onSubmit({
              identifier,
              name,
              ...(await processAudio(sound!)),
              ...(await processImage(texture!)),
              draft: owner,
            })
          }

          loading = false
        }
      },
    },
  )

  const { form: formData, enhance } = form

  const sound = fileProxy(form, "sound")
  const texture = fileProxy(form, "texture")
</script>

<form method="POST" class="space-y-2" enctype="multipart/form-data" use:enhance>
  <Form.Field {form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Name</Form.Label>
      <Input
        placeholder="Artist - Song"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.name}
      />
    </Form.Control>
    <Form.Description>This shows up on the item's tooltip.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="identifier">
    <Form.Control let:attrs>
      <Form.Label>Identifier</Form.Label>
      <Input
        placeholder="example_disc"
        autocomplete="off"
        class="max-sm:text-base"
        {...attrs}
        bind:value={$formData.identifier}
      />
    </Form.Control>
    <Form.Description>
      This identifier must be unique within the addon.
    </Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="sound">
    <Form.Control let:attrs>
      <Form.Label>Sound</Form.Label>

      <Tabs.Root
        value="upload"
        onValueChange={() => ($formData.sound = undefined)}
      >
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="upload">Upload</Tabs.Trigger>
          <Tabs.Trigger value="url">From URL</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="upload" class="space-y-2">
          <FileInput
            autocomplete="off"
            accept="audio/*"
            {...attrs}
            bind:files={$sound}
          />
          <Form.Description>
            The chosen file will automatically be converted to the right format.
          </Form.Description>
        </Tabs.Content>
        <Tabs.Content value="url" class="space-y-2">
          <Input
            placeholder="https://www.youtube.com/watch?v=mukiMaOSLEs"
            autocomplete="off"
            class="max-sm:text-base"
            {...attrs}
            bind:value={$formData.sound}
          />
          <Form.Description>
            Direct links to audio files, as well as YouTube URLs, are supported.
          </Form.Description>
        </Tabs.Content>
      </Tabs.Root>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Field {form} name="texture">
    <Form.Control let:attrs>
      <Form.Label>Texture</Form.Label>

      <Tabs.Root
        value="upload"
        onValueChange={() => ($formData.texture = undefined)}
      >
        <Tabs.List class="grid w-full grid-cols-2">
          <Tabs.Trigger value="upload">Upload</Tabs.Trigger>
          <Tabs.Trigger value="url">From URL</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="upload" class="space-y-2">
          <FileInput
            autocomplete="off"
            accept="image/*"
            {...attrs}
            bind:files={$texture}
          />
          <Form.Description>
            The chosen file will automatically be converted to the right format.
          </Form.Description>
        </Tabs.Content>
        <Tabs.Content value="url" class="space-y-2">
          <Input
            placeholder="https://disco.auxves.dev/favicon.png"
            autocomplete="off"
            class="max-sm:text-base"
            {...attrs}
            bind:value={$formData.texture}
          />
          <Form.Description>
            Direct links to image files are supported.
          </Form.Description>
        </Tabs.Content>
      </Tabs.Root>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>

  <Form.Button>
    {#if data}
      Save
    {:else}
      Create
    {/if}

    {#if loading}
      <LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</form>
