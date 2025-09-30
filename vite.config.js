import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import babel from "@rollup/plugin-babel";
import path from 'path';
import svgLoader from 'vite-svg-loader';
export default defineConfig({
  server:{
    host:'0.0.0.0'
  },
  plugins: [vue(), svgLoader()],
  base: "./",  // 确保资源路径为相对路径
  build: {
    target: "es2015",
    rollupOptions: {
      plugins: [
        babel({
          babelHelpers: "bundled",
          include: [/src/],
          extensions: [".js", ".ts", ".vue"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
              },
            ],
          ],
        }),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
