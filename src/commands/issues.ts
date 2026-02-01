import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch } from "../api.js";

export function createIssuesCommand(): Command {
  const issues = new Command("issues").description("Manage issues");

  issues
    .command("list")
    .description("List issues in a repository")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .option("--state <state>", "Filter by state (open/closed)", "open")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const issuesList = await apiGet<any[]>(
          `/api/repositories/${ownerIdentifier}/${name}/issues?state=${options.state}`
        );

        if (issuesList.length === 0) {
          console.log(chalk.yellow(`No ${options.state} issues found`));
          return;
        }

        console.log(
          chalk.bold(`Issues in @${ownerIdentifier}/${name} (${issuesList.length})`)
        );
        console.log();

        for (const issue of issuesList) {
          const stateIcon = issue.state === "open" ? "🟢" : "⚪";
          console.log(
            `${stateIcon} #${issue.number} ${chalk.cyan(issue.title)}`
          );
          console.log(
            chalk.dim(`   by @${issue.author.username} · ${new Date(issue.createdAt).toLocaleDateString()}`)
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("view")
    .description("View issue details")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const issue = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}`
        );

        const stateIcon = issue.state === "open" ? "🟢" : "⚪";
        console.log(
          `${stateIcon} ${chalk.bold(`#${issue.number} ${issue.title}`)}`
        );
        console.log(
          chalk.dim(
            `by @${issue.author.username} · ${new Date(issue.createdAt).toLocaleDateString()}`
          )
        );
        console.log();
        if (issue.body) {
          console.log(issue.body);
          console.log();
        }
        console.log(chalk.dim(`State: ${issue.state}`));
        if (issue.closedAt) {
          console.log(
            chalk.dim(`Closed: ${new Date(issue.closedAt).toLocaleDateString()}`)
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("create")
    .description("Create a new issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--title <title>", "Issue title")
    .option("--body <body>", "Issue description")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const issue = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues`,
          {
            title: options.title,
            body: options.body || "",
          }
        );

        console.log(chalk.green("✓ Issue created successfully"));
        console.log(chalk.dim(`  #${issue.number} ${issue.title}`));
        console.log(
          chalk.dim(`  @${ownerIdentifier}/${name}#${issue.number}`)
        );
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("close")
    .description("Close an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPatch<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}`,
          {
            state: "closed",
          }
        );

        console.log(chalk.green("✓ Issue closed successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("comment")
    .description("Add a comment to an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .requiredOption("--body <body>", "Comment text")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/comments`,
          {
            body: options.body,
          }
        );

        console.log(chalk.green("✓ Comment added successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return issues;
}

function parseRepoArg(arg: string): [string, string] {
  const match = arg.match(/^@?([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error(
      `Invalid repository format: ${arg}. Expected format: @owner/name or owner/name`
    );
  }
  return [match[1], match[2]];
}
