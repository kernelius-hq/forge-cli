import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch } from "../api.js";

export function createPrsCommand(): Command {
  const prs = new Command("prs")
    .alias("pr")
    .description("Manage pull requests");

  prs
    .command("list")
    .description("List pull requests in a repository")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .option("--state <state>", "Filter by state (open/closed/merged)", "open")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const prsList = await apiGet<any[]>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests?state=${options.state}`
        );

        if (prsList.length === 0) {
          console.log(chalk.yellow(`No ${options.state} pull requests found`));
          return;
        }

        console.log(
          chalk.bold(
            `Pull Requests in @${ownerIdentifier}/${name} (${prsList.length})`
          )
        );
        console.log();

        for (const pr of prsList) {
          const stateIcon =
            pr.state === "open" ? "🟢" : pr.state === "merged" ? "🟣" : "⚪";
          console.log(`${stateIcon} #${pr.number} ${chalk.cyan(pr.title)}`);
          console.log(
            chalk.dim(
              `   ${pr.headBranch} → ${pr.baseBranch} by @${pr.author.username} · ${new Date(pr.createdAt).toLocaleDateString()}`
            )
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("view")
    .description("View pull request details")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests/${options.number}`
        );

        const stateIcon =
          pr.state === "open" ? "🟢" : pr.state === "merged" ? "🟣" : "⚪";
        console.log(`${stateIcon} ${chalk.bold(`#${pr.number} ${pr.title}`)}`);
        console.log(
          chalk.dim(
            `${pr.headBranch} → ${pr.baseBranch} by @${pr.author.username} · ${new Date(pr.createdAt).toLocaleDateString()}`
          )
        );
        console.log();
        if (pr.body) {
          console.log(pr.body);
          console.log();
        }
        console.log(chalk.dim(`State: ${pr.state}`));
        if (pr.mergedAt) {
          console.log(
            chalk.dim(`Merged: ${new Date(pr.mergedAt).toLocaleDateString()}`)
          );
        }
        if (pr.closedAt) {
          console.log(
            chalk.dim(`Closed: ${new Date(pr.closedAt).toLocaleDateString()}`)
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("create")
    .description("Create a new pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--head <branch>", "Head branch (source)")
    .requiredOption("--base <branch>", "Base branch (target)")
    .requiredOption("--title <title>", "PR title")
    .option("--body <body>", "PR description")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests`,
          {
            headBranch: options.head,
            baseBranch: options.base,
            title: options.title,
            body: options.body || "",
          }
        );

        console.log(chalk.green("✓ Pull request created successfully"));
        console.log(chalk.dim(`  #${pr.number} ${pr.title}`));
        console.log(
          chalk.dim(`  @${ownerIdentifier}/${name}#${pr.number}`)
        );
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("merge")
    .description("Merge a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .option("--method <method>", "Merge method (merge/squash/rebase)", "merge")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests/${options.number}/merge`,
          {
            mergeMethod: options.method,
          }
        );

        console.log(chalk.green("✓ Pull request merged successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("close")
    .description("Close a pull request without merging")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPatch<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests/${options.number}`,
          {
            state: "closed",
          }
        );

        console.log(chalk.green("✓ Pull request closed successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("comment")
    .description("Add a comment to a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .requiredOption("--body <body>", "Comment text")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pull-requests/${options.number}/comments`,
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

  return prs;
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
