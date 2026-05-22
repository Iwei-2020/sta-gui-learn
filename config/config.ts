import { defineConfig } from "@umijs/max";
import routes from "./routes";

export default defineConfig({
  base: "/",
  publicPath: "/",
  antd: {},
  model: {},
  initialState: {},
  request: {},
  links: [{ href: "favicon.ico", rel: "icon" }],
  exportStatic: {},
  routes,
  npmClient: "npm",
  proxy: {},
  hash: true,
  outputPath: "app/bundled",
  mfsu: false,
  esbuildMinifyIIFE: true,
});
