import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiDelete } from "../api.js";
import { spawn } from "node:child_process";
import { getConfig } from "../config.js";
import { getTemplateById } from "./templates.js";

export function createReposCommand(): Command {
  const repos = new Command("repos").description(
    "Manage repositories"
  );

  repos
    .command("list")
    .description("List accessible repositories")
    .action(async () => {
      try {
        // Get current user to list their repositories
        const user = await apiGet<any>("/api/users/me");
        const result = await apiGet<{ repos: any[] }>(
          `/api/repositories/user/${user.username}`
        );

        const repositories = result.repos || [];

        if (repositories.length === 0) {
          console.log(chalk.yellow("No repositories found"));
          return;
        }

        console.log(chalk.bold(`Repositories (${repositories.length})`));
        console.log();

        for (const repo of repositories) {
          const ownerName = repo.owner?.identifier || repo.owner?.username || user.username;
          const identifier = `@${ownerName}/${repo.name}`;
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
    .option("--template <id>", "Repository template ID (e.g., patient-record, research-dataset, code-repository)")
    .action(async (options) => {
      try {
        const { name, description, visibility, org, template } = options;

        // Validate template ID if provided
        if (template) {
          const templateObj = getTemplateById(template);
          if (!templateObj) {
            console.error(chalk.red(`Error: Template "${template}" not found`));
            console.log(chalk.dim("\nAvailable templates:"));
            console.log(chalk.dim("  Use 'forge templates list' to see all available templates"));
            console.log(chalk.dim("  Use 'forge templates view <id>' to see template details"));
            process.exit(1);
          }
        }

        // Get current user to determine default org
        const user = await apiGet<any>("/api/users/me");
        const orgIdentifier = org || user.username;

        const repo = await apiPost<any>("/api/repositories", {
          name,
          description,
          visibility,
          orgIdentifier,
          templateId: template,
        });

        console.log(chalk.green("✓ Repository created successfully"));
        console.log(chalk.dim(`  @${repo.ownerIdentifier}/${repo.name}`));
        if (template) {
          const templateObj = getTemplateById(template);
          console.log(chalk.dim(`  Template: ${templateObj?.name || template}`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("fork")
    .description("Fork a repository")
    .argument("<repo>", "Repository to fork (@owner/name)")
    .option("--name <name>", "Custom name for the fork")
    .option("--org <identifier>", "Fork into organization (defaults to your personal org)")
    .action(async (repoArg: string, options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        // Get current user to determine default org
        const user = await apiGet<any>("/api/users/me");
        const targetOrgIdentifier = options.org || user.username;

        const fork = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/fork`,
          {
            name: options.name || name,
            orgIdentifier: targetOrgIdentifier,
          }
        );

        console.log(chalk.green("✓ Repository forked successfully"));
        console.log(chalk.dim(`  @${fork.ownerIdentifier}/${fork.name}`));
        console.log(chalk.dim(`  Forked from @${ownerIdentifier}/${name}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("star")
    .description("Star a repository")
    .argument("<repo>", "Repository (@owner/name)")
    .action(async (repoArg: string) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/star`,
          {}
        );

        console.log(chalk.green(`✓ Starred @${ownerIdentifier}/${name}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("unstar")
    .description("Unstar a repository")
    .argument("<repo>", "Repository (@owner/name)")
    .action(async (repoArg: string) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/unstar`,
          {}
        );

        console.log(chalk.green(`✓ Unstarred @${ownerIdentifier}/${name}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("stars")
    .description("List starred repositories")
    .action(async () => {
      try {
        const user = await apiGet<any>("/api/users/me");
        const result = await apiGet<{ stars: any[] }>(
          `/api/users/${user.id}/starred`
        );

        const stars = result.stars || [];

        if (stars.length === 0) {
          console.log(chalk.yellow("No starred repositories"));
          return;
        }

        console.log(chalk.bold(`Starred Repositories (${stars.length})`));
        console.log();

        for (const star of stars) {
          const repo = star.repository;
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
    .command("edit")
    .description("Edit repository details")
    .argument("<repo>", "Repository (@owner/name)")
    .option("--name <name>", "New repository name")
    .option("--description <desc>", "New description")
    .option("--visibility <type>", "Visibility (public/private)")
    .action(async (repoArg: string, options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        const updates: any = {};
        if (options.name) updates.name = options.name;
        if (options.description !== undefined) updates.description = options.description;
        if (options.visibility) updates.visibility = options.visibility;

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow("No updates specified. Use --name, --description, or --visibility"));
          return;
        }

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/settings`,
          updates
        );

        console.log(chalk.green("✓ Repository updated successfully"));
        if (options.name) {
          console.log(chalk.dim(`  Renamed to: ${options.name}`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  repos
    .command("delete")
    .description("Delete a repository")
    .argument("<repo>", "Repository (@owner/name)")
    .option("--confirm", "Skip confirmation prompt")
    .action(async (repoArg: string, options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(repoArg);

        if (!options.confirm) {
          console.log(chalk.yellow(`⚠️  WARNING: This will permanently delete @${ownerIdentifier}/${name}`));
          console.log(chalk.dim("Run with --confirm to proceed"));
          process.exit(1);
        }

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/delete`,
          {}
        );

        console.log(chalk.green(`✓ Repository @${ownerIdentifier}/${name} deleted`));
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
