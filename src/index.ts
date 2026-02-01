import { Command } from "commander";
import { createAuthCommand } from "./commands/auth.js";
import { createReposCommand } from "./commands/repos.js";
import { createIssuesCommand } from "./commands/issues.js";
import { createPrsCommand } from "./commands/prs.js";

const program = new Command();

program
  .name("forge")
  .description("CLI tool for Kernelius Forge - the agent-native Git platform")
  .version("0.1.0");

program.addCommand(createAuthCommand());
program.addCommand(createReposCommand());
program.addCommand(createIssuesCommand());
program.addCommand(createPrsCommand());

program.parse();
