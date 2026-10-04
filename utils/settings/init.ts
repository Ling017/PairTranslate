import { browser } from "#imports";
import { STORAGE_KEYS } from "~/utils/constants";
import { generateDefaultSettings, generateServicesSettings } from "./default";
import {
	clearSettingsMigrationError,
	type SettingsMigrationErrorState,
} from "./helper";
import { migrateSettings } from "./migration";

export async function initializeSettings(): Promise<void> {
	try {
		const res = await browser.storage.local.get([STORAGE_KEYS.settings]);
		if (!res[STORAGE_KEYS.settings]) {
			const defaultSettings = generateDefaultSettings();
			await browser.storage.local.set({
				[STORAGE_KEYS.settings]: defaultSettings,
			});
		} else {
			const final = migrateSettings(res[STORAGE_KEYS.settings]);
			const publicId = "514e1362-6c8b-4cda-9d10-62b8c3de52c1";
			if (!final.services[publicId]) final.services[publicId] = generateServicesSettings()[publicId];
			await browser.storage.local.set({
				[STORAGE_KEYS.settings]: final,
			});
		}
		await clearSettingsMigrationError();
	} catch (error) {
		await markSettingsMigrationError(error);
		throw error;
	}
}

async function markSettingsMigrationError(error: unknown): Promise<void> {
	const payload: SettingsMigrationErrorState = {
		message: error instanceof Error ? error.message : String(error),
		timestamp: Date.now(),
	};
	await browser.storage.local.set({
		[STORAGE_KEYS.settingsMigrationError]: payload,
	});
}
