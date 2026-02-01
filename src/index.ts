import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createAuthCommand } from "./commands/auth.js";
import { createReposCommand } from "./commands/repos.js";
import { createIssuesCommand } from "./commands/issues.js";
import { createPrsCommand } from "./commands/prs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

program
  .name("forge")
  .description("CLI tool for Kernelius Forge - the agent-native Git platform")
  .version(packageJson.version);

program.addCommand(createAuthCommand());
program.addCommand(createReposCommand());
program.addCommand(createIssuesCommand());
program.addCommand(createPrsCommand());

program.parse();
