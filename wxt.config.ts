import { transform } from "esbuild";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import { OPEN_TRANSLATOR_POPUP_COMMAND } from "./utils/constants";

// See https://wxt.dev/api/config.html
export default defineConfig({
	imports: false,
	modules: [
		"@wxt-dev/module-solid",
		"@wxt-dev/i18n/module",
		"@wxt-dev/auto-icons",
	],
	autoIcons: {
		developmentIndicator: false,
	},
	manifest: {
		name: "__MSG_meta_name__",
		description: "__MSG_meta_description__",
		version: process.env.npm_package_version || "0.0.0",
		permissions: ["storage"],
		host_permissions: ["<all_urls>"],
		default_locale: "en",
		commands: {
			[OPEN_TRANSLATOR_POPUP_COMMAND]: {
				suggested_key: {
					default: "Alt+Shift+T",
				},
				description: "__MSG_commands_openTranslatorPopup__",
				global: true,
			},
		},
		web_accessible_resources: [
			{
				resources: ["katex/*", "icons/*", "iframe.html"],
				matches: ["<all_urls>"],
			},
		],
	},
	vite: () => ({
		plugins: [
			tailwindcss(),
			{
				name: "chrome-content-ascii",
				async generateBundle(_options, bundle) {
					for (const output of Object.values(bundle)) {
						if (output.type === "chunk" && output.fileName.includes("content")) {
							output.code = (await transform(output.code, { charset: "ascii", target: "esnext", minify: true })).code;
						}
					}
				},
			},
			{
				// Tailwind doesn't provide any official way to convert rem to px, so we do it ourselves
				name: "vite-plugin-rem-to-px",
				async transform(code, id) {
					if (id.includes("shadow.css")) {
						return code.replace(/([\d.]+)rem/g, (_, p1) => {
							const px = Math.round(parseFloat(p1) * 16);
							return `${px}px`;
						});
					}
					return null;
				},
			},
		],
		define: {
			__APP_VERSION__: JSON.stringify(
				process.env.npm_package_version || "0.0.0",
			),
		},
	}),
});
