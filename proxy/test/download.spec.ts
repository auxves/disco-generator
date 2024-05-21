import { SELF } from "cloudflare:test"
import { describe, it, expect } from "vitest"

describe("Download", () => {
  it("proxies example.com", async () => {
    const target = "https://example.com"
    const response = await SELF.fetch(
      `https://example.com/download?target=${encodeURIComponent(target)}`,
    )
    expect(await response.text()).toMatchSnapshot()
  })

  it("proxies youtube", async () => {
    const id = "Ec18vXsDHYU"
    const targets = [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtube.com/watch?v=${id}`,
      `https://music.youtube.com/watch?v=${id}`,
      `https://youtu.be/${id}`,
    ]

    for (const target of targets) {
      const response = await SELF.fetch(
        `https://example.com/download?target=${encodeURIComponent(target)}`,
      )

      expect(await response.arrayBuffer()).toSatisfy(
        (buf: ArrayBuffer) => buf.byteLength > 0,
      )
    }
  })
})
