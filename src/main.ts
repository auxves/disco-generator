import "./app.scss"
import App from "./App.svelte"

addEventListener("beforeunload", () =>
  confirm("Are you sure you want to exit?")
)

const app = new App({
  target: document.getElementById("app"),
})

export default app
