import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

export interface ForgeConfig {
  apiUrl: string;
  apiKey?: string;
  agentId?: string;
  agentName?: string;
}

const CONFIG_DIR = join(homedir(), ".config", "forge");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export async function getConfig(): Promise<ForgeConfig> {
  if (!existsSync(CONFIG_PATH)) {
    return {
      apiUrl: "https://forge-api.kernelius.com",
    };
  }

  try {
    const content = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read config: ${error}`);
  }
}

export async function saveConfig(config: ForgeConfig): Promise<void> {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

export async function clearConfig(): Promise<void> {
  const config: ForgeConfig = {
    apiUrl: "https://forge-api.kernelius.com",
  };
  await saveConfig(config);
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
