import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

// tắt Vue Devtools
app.config.devtools = false;

app.mount("#app");
