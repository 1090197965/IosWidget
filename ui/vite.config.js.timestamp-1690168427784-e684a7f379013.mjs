var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tailwind.config.cjs
var require_tailwind_config = __commonJS({
  "tailwind.config.cjs"(exports, module) {
    module.exports = {
      content: ["./src/**/*.{html,js,svelte}", "./node_modules/stdf/src/**/*.svelte"],
      theme: {
        colors: {
          blue: "#0B24FB",
          yellow: "#FFC043",
          primary: "#0B24FB",
          dark: "#FFC043",
          purple: "#7356BF",
          green: "#05944F",
          orange: "#FF6937",
          primaryBlack: "#09101D",
          black: "#000000",
          gray1: "#23262B",
          gray2: "#2A2B2F",
          gray3: "#303239",
          gray4: "#373940",
          gray5: "#414249",
          gray6: "#747B84",
          gray7: "#DADEE3",
          gray8: "#EBEEF2",
          gray9: "#F4F6F9",
          gray10: "#FAFAFB",
          success: "#11BB8D",
          warning: "#B95000",
          error: "#DA1414",
          info: "#2E5AAC",
          transparent: "transparent"
        },
        extend: {
          colors: {
            white: "#fff",
            primaryBlack: "#09101D",
            black: "#000000",
            yellow: "#FFC043"
          },
          keyframes: {
            wiggle: {
              "0%, 100%": { transform: "rotate(-3deg)" },
              "50%": { transform: "rotate(3deg)" }
            },
            path: {
              "0%": { "stroke-dashoffset": 400, fill: "transparent" },
              "30%": { "stroke-dashoffset": 0, fill: "transparent" },
              "32%": { "stroke-dashoffset": 0, fill: "currentColor" },
              "33%": { opacity: 0 },
              "35%": { opacity: 1 },
              "37%": { opacity: 0 },
              "39%": { opacity: 1 },
              "40%": { "stroke-dashoffset": 0, fill: "currentColor" },
              "99%": { "stroke-dashoffset": 0, fill: "currentColor" },
              "100%": { "stroke-dashoffset": 400, fill: "transparent" }
            }
          },
          animation: {
            wiggle: "wiggle 1s ease-in-out infinite",
            path: "path 3s linear infinite"
          }
        }
      },
      darkMode: "class",
      plugins: []
    };
  }
});

// postcss.config.cjs
var import_tailwind_config = __toESM(require_tailwind_config());
import tailwind from "file:///D:/Documents/Desktop/%E7%9B%AE%E5%BD%95/scriptables/ui/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///D:/Documents/Desktop/%E7%9B%AE%E5%BD%95/scriptables/ui/node_modules/autoprefixer/lib/autoprefixer.js";
var postcss_config_default = {
  plugins: [tailwind(import_tailwind_config.default), autoprefixer]
};

// vite.config.js
import { defineConfig } from "file:///D:/Documents/Desktop/%E7%9B%AE%E5%BD%95/scriptables/ui/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///D:/Documents/Desktop/%E7%9B%AE%E5%BD%95/scriptables/ui/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [svelte()],
  css: { postcss: postcss_config_default },
  server: {
    hmr: true,
    host: "0.0.0.0",
    port: 8888,
    // 是否开启 https
    https: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidGFpbHdpbmQuY29uZmlnLmNqcyIsICJwb3N0Y3NzLmNvbmZpZy5janMiLCAidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2N1bWVudHNcXFxcRGVza3RvcFxcXFxcdTc2RUVcdTVGNTVcXFxcc2NyaXB0YWJsZXNcXFxcdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXERvY3VtZW50c1xcXFxEZXNrdG9wXFxcXFx1NzZFRVx1NUY1NVxcXFxzY3JpcHRhYmxlc1xcXFx1aVxcXFx0YWlsd2luZC5jb25maWcuY2pzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Eb2N1bWVudHMvRGVza3RvcC8lRTclOUIlQUUlRTUlQkQlOTUvc2NyaXB0YWJsZXMvdWkvdGFpbHdpbmQuY29uZmlnLmNqc1wiOy8qKiBAdHlwZSB7aW1wb3J0KCd0YWlsd2luZGNzcycpLkNvbmZpZ30gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvbnRlbnQ6IFsnLi9zcmMvKiovKi57aHRtbCxqcyxzdmVsdGV9JywgJy4vbm9kZV9tb2R1bGVzL3N0ZGYvc3JjLyoqLyouc3ZlbHRlJ10sXG4gICAgdGhlbWU6IHtcbiAgICAgICAgY29sb3JzOiB7XG4gICAgICAgICAgICBibHVlOiAnIzBCMjRGQicsXG4gICAgICAgICAgICB5ZWxsb3c6ICcjRkZDMDQzJyxcbiAgICAgICAgICAgIHByaW1hcnk6ICcjMEIyNEZCJyxcbiAgICAgICAgICAgIGRhcms6ICcjRkZDMDQzJyxcbiAgICAgICAgICAgIHB1cnBsZTogJyM3MzU2QkYnLFxuICAgICAgICAgICAgZ3JlZW46ICcjMDU5NDRGJyxcbiAgICAgICAgICAgIG9yYW5nZTogJyNGRjY5MzcnLFxuICAgICAgICAgICAgcHJpbWFyeUJsYWNrOiAnIzA5MTAxRCcsXG4gICAgICAgICAgICBibGFjazogJyMwMDAwMDAnLFxuICAgICAgICAgICAgZ3JheTE6ICcjMjMyNjJCJyxcbiAgICAgICAgICAgIGdyYXkyOiAnIzJBMkIyRicsXG4gICAgICAgICAgICBncmF5MzogJyMzMDMyMzknLFxuICAgICAgICAgICAgZ3JheTQ6ICcjMzczOTQwJyxcbiAgICAgICAgICAgIGdyYXk1OiAnIzQxNDI0OScsXG4gICAgICAgICAgICBncmF5NjogJyM3NDdCODQnLFxuICAgICAgICAgICAgZ3JheTc6ICcjREFERUUzJyxcbiAgICAgICAgICAgIGdyYXk4OiAnI0VCRUVGMicsXG4gICAgICAgICAgICBncmF5OTogJyNGNEY2RjknLFxuICAgICAgICAgICAgZ3JheTEwOiAnI0ZBRkFGQicsXG4gICAgICAgICAgICBzdWNjZXNzOiAnIzExQkI4RCcsXG4gICAgICAgICAgICB3YXJuaW5nOiAnI0I5NTAwMCcsXG4gICAgICAgICAgICBlcnJvcjogJyNEQTE0MTQnLFxuICAgICAgICAgICAgaW5mbzogJyMyRTVBQUMnLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH0sXG4gICAgICAgIGV4dGVuZDoge1xuICAgICAgICAgICAgY29sb3JzOiB7XG4gICAgICAgICAgICAgICAgd2hpdGU6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICBwcmltYXJ5QmxhY2s6ICcjMDkxMDFEJyxcbiAgICAgICAgICAgICAgICBibGFjazogJyMwMDAwMDAnLFxuICAgICAgICAgICAgICAgIHllbGxvdzogJyNGRkMwNDMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtleWZyYW1lczoge1xuICAgICAgICAgICAgICAgIHdpZ2dsZToge1xuICAgICAgICAgICAgICAgICAgICAnMCUsIDEwMCUnOiB7IHRyYW5zZm9ybTogJ3JvdGF0ZSgtM2RlZyknIH0sXG4gICAgICAgICAgICAgICAgICAgICc1MCUnOiB7IHRyYW5zZm9ybTogJ3JvdGF0ZSgzZGVnKScgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgJzAlJzogeyAnc3Ryb2tlLWRhc2hvZmZzZXQnOiA0MDAsIGZpbGw6ICd0cmFuc3BhcmVudCcgfSxcbiAgICAgICAgICAgICAgICAgICAgJzMwJSc6IHsgJ3N0cm9rZS1kYXNob2Zmc2V0JzogMCwgZmlsbDogJ3RyYW5zcGFyZW50JyB9LFxuICAgICAgICAgICAgICAgICAgICAnMzIlJzogeyAnc3Ryb2tlLWRhc2hvZmZzZXQnOiAwLCBmaWxsOiAnY3VycmVudENvbG9yJyB9LFxuICAgICAgICAgICAgICAgICAgICAnMzMlJzogeyBvcGFjaXR5OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICczNSUnOiB7IG9wYWNpdHk6IDEgfSxcbiAgICAgICAgICAgICAgICAgICAgJzM3JSc6IHsgb3BhY2l0eTogMCB9LFxuICAgICAgICAgICAgICAgICAgICAnMzklJzogeyBvcGFjaXR5OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICc0MCUnOiB7ICdzdHJva2UtZGFzaG9mZnNldCc6IDAsIGZpbGw6ICdjdXJyZW50Q29sb3InIH0sXG4gICAgICAgICAgICAgICAgICAgICc5OSUnOiB7ICdzdHJva2UtZGFzaG9mZnNldCc6IDAsIGZpbGw6ICdjdXJyZW50Q29sb3InIH0sXG4gICAgICAgICAgICAgICAgICAgICcxMDAlJzogeyAnc3Ryb2tlLWRhc2hvZmZzZXQnOiA0MDAsIGZpbGw6ICd0cmFuc3BhcmVudCcgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgICAgIHdpZ2dsZTogJ3dpZ2dsZSAxcyBlYXNlLWluLW91dCBpbmZpbml0ZScsXG4gICAgICAgICAgICAgICAgcGF0aDogJ3BhdGggM3MgbGluZWFyIGluZmluaXRlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBkYXJrTW9kZTogJ2NsYXNzJyxcbiAgICBwbHVnaW5zOiBbXSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXERvY3VtZW50c1xcXFxEZXNrdG9wXFxcXFx1NzZFRVx1NUY1NVxcXFxzY3JpcHRhYmxlc1xcXFx1aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRG9jdW1lbnRzXFxcXERlc2t0b3BcXFxcXHU3NkVFXHU1RjU1XFxcXHNjcmlwdGFibGVzXFxcXHVpXFxcXHBvc3Rjc3MuY29uZmlnLmNqc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovRG9jdW1lbnRzL0Rlc2t0b3AvJUU3JTlCJUFFJUU1JUJEJTk1L3NjcmlwdGFibGVzL3VpL3Bvc3Rjc3MuY29uZmlnLmNqc1wiO2ltcG9ydCB0YWlsd2luZCBmcm9tICd0YWlsd2luZGNzcyc7XG5pbXBvcnQgdGFpbHdpbmRDb25maWcgZnJvbSAnLi90YWlsd2luZC5jb25maWcuY2pzJztcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHBsdWdpbnM6IFt0YWlsd2luZCh0YWlsd2luZENvbmZpZyksIGF1dG9wcmVmaXhlcl0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2N1bWVudHNcXFxcRGVza3RvcFxcXFxcdTc2RUVcdTVGNTVcXFxcc2NyaXB0YWJsZXNcXFxcdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXERvY3VtZW50c1xcXFxEZXNrdG9wXFxcXFx1NzZFRVx1NUY1NVxcXFxzY3JpcHRhYmxlc1xcXFx1aVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovRG9jdW1lbnRzL0Rlc2t0b3AvJUU3JTlCJUFFJUU1JUJEJTk1L3NjcmlwdGFibGVzL3VpL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBvc3Rjc3MgZnJvbSAnLi9wb3N0Y3NzLmNvbmZpZy5janMnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBzdmVsdGUgfSBmcm9tICdAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgYmFzZTogJy4vJyxcbiAgICBwbHVnaW5zOiBbc3ZlbHRlKCldLFxuICAgIGNzczogeyBwb3N0Y3NzIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICAgIGhtcjogdHJ1ZSxcbiAgICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgICBwb3J0OiA4ODg4LFxuICAgICAgICAvLyBcdTY2MkZcdTU0MjZcdTVGMDBcdTU0MkYgaHR0cHNcbiAgICAgICAgaHR0cHM6IGZhbHNlLFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFDQSxXQUFPLFVBQVU7QUFBQSxNQUNiLFNBQVMsQ0FBQywrQkFBK0IscUNBQXFDO0FBQUEsTUFDOUUsT0FBTztBQUFBLFFBQ0gsUUFBUTtBQUFBLFVBQ0osTUFBTTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsU0FBUztBQUFBLFVBQ1QsTUFBTTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsT0FBTztBQUFBLFVBQ1AsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsUUFBUTtBQUFBLFVBQ1IsU0FBUztBQUFBLFVBQ1QsU0FBUztBQUFBLFVBQ1QsT0FBTztBQUFBLFVBQ1AsTUFBTTtBQUFBLFVBQ04sYUFBYTtBQUFBLFFBQ2pCO0FBQUEsUUFDQSxRQUFRO0FBQUEsVUFDSixRQUFRO0FBQUEsWUFDSixPQUFPO0FBQUEsWUFDUCxjQUFjO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUCxRQUFRO0FBQUEsVUFDWjtBQUFBLFVBQ0EsV0FBVztBQUFBLFlBQ1AsUUFBUTtBQUFBLGNBQ0osWUFBWSxFQUFFLFdBQVcsZ0JBQWdCO0FBQUEsY0FDekMsT0FBTyxFQUFFLFdBQVcsZUFBZTtBQUFBLFlBQ3ZDO0FBQUEsWUFDQSxNQUFNO0FBQUEsY0FDRixNQUFNLEVBQUUscUJBQXFCLEtBQUssTUFBTSxjQUFjO0FBQUEsY0FDdEQsT0FBTyxFQUFFLHFCQUFxQixHQUFHLE1BQU0sY0FBYztBQUFBLGNBQ3JELE9BQU8sRUFBRSxxQkFBcUIsR0FBRyxNQUFNLGVBQWU7QUFBQSxjQUN0RCxPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQUEsY0FDcEIsT0FBTyxFQUFFLFNBQVMsRUFBRTtBQUFBLGNBQ3BCLE9BQU8sRUFBRSxTQUFTLEVBQUU7QUFBQSxjQUNwQixPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQUEsY0FDcEIsT0FBTyxFQUFFLHFCQUFxQixHQUFHLE1BQU0sZUFBZTtBQUFBLGNBQ3RELE9BQU8sRUFBRSxxQkFBcUIsR0FBRyxNQUFNLGVBQWU7QUFBQSxjQUN0RCxRQUFRLEVBQUUscUJBQXFCLEtBQUssTUFBTSxjQUFjO0FBQUEsWUFDNUQ7QUFBQSxVQUNKO0FBQUEsVUFDQSxXQUFXO0FBQUEsWUFDUCxRQUFRO0FBQUEsWUFDUixNQUFNO0FBQUEsVUFDVjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsTUFDQSxVQUFVO0FBQUEsTUFDVixTQUFTLENBQUM7QUFBQSxJQUNkO0FBQUE7QUFBQTs7O0FDOURBLDZCQUEyQjtBQUQ2UyxPQUFPLGNBQWM7QUFFN1YsT0FBTyxrQkFBa0I7QUFFekIsSUFBTyx5QkFBUTtBQUFBLEVBQ1gsU0FBUyxDQUFDLFNBQVMsdUJBQUFBLE9BQWMsR0FBRyxZQUFZO0FBQ3BEOzs7QUNMQSxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGNBQWM7QUFHdkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsTUFBTTtBQUFBLEVBQ04sU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUFBLEVBQ2xCLEtBQUssRUFBRSxnQ0FBUTtBQUFBLEVBQ2YsUUFBUTtBQUFBLElBQ0osS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixPQUFPO0FBQUEsRUFDWDtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbInRhaWx3aW5kQ29uZmlnIl0KfQo=
