import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost } from "../api.js";
import { spawn } from "node:child_process";
import { getConfig } from "../config.js";

export function createReposCommand(): Command {
  const repos = new Command("repos").description(
    "Manage repositories"
  );

  repos
    .command("list")
    .description("List accessible repositories")
    .action(async () => {
      try {
        const repositories = await apiGet<any[]>("/api/repositories");

        if (repositories.length === 0) {
          console.log(chalk.yellow("No repositories found"));
          return;
        }

        console.log(chalk.bold(`Repositories (${repositories.length})`));
        console.log();

        for (const repo of repositories) {
          const identifier = `@${repo.ownerIdentifier}/${repo.name}`;
          const visibility = repo.visibility === "private" ? "🔒" : "🌐";

          console.log(`${visibility} ${chalk.cyan(identifier)}`);
          if (repo.description) {
            console.log(chalk.dim(`   ${repo.description}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("view")
    .description("View repository details")
    .argument("<repo>", "Repository (@owner/name)")
    .action(async (repoArg: string) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        const repo = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}`
        );

        console.log(chalk.bold(`${repo.ownerIdentifier}/${repo.name}`));
        if (repo.description) {
          console.log(chalk.dim(repo.description));
        }
        console.log();
        console.log(chalk.dim(`  Visibility: ${repo.visibility}`));
        console.log(chalk.dim(`  Type: ${repo.repoType || "standard"}`));
        console.log(chalk.dim(`  Created: ${new Date(repo.createdAt).toLocaleDateString()}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("clone")
    .description("Clone a repository")
    .argument("<repo>", "Repository (@owner/name)")
    .argument("[destination]", "Destination directory")
    .action(async (repoArg: string, destination?: string) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);
        const config = await getConfig();

        // Get repository details to ensure it exists
        await apiGet<any>(`/api/repositories/${ownerIdentifier}/${name}`);

        // Construct git clone URL
        const apiUrl = new URL(config.apiUrl);
        const cloneUrl = `${apiUrl.protocol}//${apiUrl.host}/git/${ownerIdentifier}/${name}`;

        const dest = destination || name;

        console.log(chalk.dim(`Cloning ${ownerIdentifier}/${name} into ${dest}...`));

        // Use git clone with credentials
        const gitProcess = spawn(
          "git",
          ["clone", cloneUrl, dest],
          {
            stdio: "inherit",
            env: {
              ...process.env,
              GIT_TERMINAL_PROMPT: "0",
            },
          }
        );

        await new Promise<void>((resolve, reject) => {
          gitProcess.on("exit", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`git clone exited with code ${code}`));
            }
          });
        });

        console.log(chalk.green(`✓ Repository cloned successfully`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("create")
    .description("Create a new repository")
    .requiredOption("--name <name>", "Repository name")
    .option("--description <desc>", "Repository description")
    .option("--visibility <type>", "Visibility (public/private)", "private")
    .option("--org <identifier>", "Organization identifier (defaults to your personal org)")
    .action(async (options) => {
      try {
        const { name, description, visibility, org } = options;

        // Get current user to determine default org
        const user = await apiGet<any>("/api/users/me");
        const orgIdentifier = org || user.username;

        const repo = await apiPost<any>("/api/repositories", {
          name,
          description,
          visibility,
          orgIdentifier,
        });

        console.log(chalk.green("✓ Repository created successfully"));
        console.log(chalk.dim(`  @${repo.ownerIdentifier}/${repo.name}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return repos;
}

function parseRepoArg(arg: string): [string, string] {
  // Handle @owner/name format
  const match = arg.match(/^@?([^/]+)\/(.+)$/);

  if (!match) {
    throw new Error(
      `Invalid repository format: ${arg}. Expected format: @owner/name or owner/name`
    );
  }

  return [match[1], match[2]];
}
