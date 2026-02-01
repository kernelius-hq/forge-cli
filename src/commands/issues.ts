import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api.js";

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

        const result = await apiGet<{ issues: any[]; hasMore: boolean }>(
          `/api/repositories/${ownerIdentifier}/${name}/issues?state=${options.state}`
        );

        const issuesList = result.issues || [];

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
            chalk.dim(`   by @${issue.author?.username || "unknown"} · ${new Date(issue.createdAt).toLocaleDateString()}`)
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

  issues
    .command("edit")
    .description("Edit an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .option("--title <title>", "New title")
    .option("--body <body>", "New body/description")
    .option("--state <state>", "State (open/closed)")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const updates: any = {};
        if (options.title) updates.title = options.title;
        if (options.body !== undefined) updates.body = options.body;
        if (options.state) updates.state = options.state;

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow("No updates specified. Use --title, --body, or --state"));
          return;
        }

        await apiPatch<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}`,
          updates
        );

        console.log(chalk.green("✓ Issue updated successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("reopen")
    .description("Reopen a closed issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPatch<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}`,
          {
            state: "open",
          }
        );

        console.log(chalk.green("✓ Issue reopened successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("comments")
    .description("List comments on an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const result = await apiGet<{ comments: any[] }>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/comments`
        );

        const comments = result.comments || [];

        if (comments.length === 0) {
          console.log(chalk.yellow("No comments found"));
          return;
        }

        console.log(chalk.bold(`Comments (${comments.length})`));
        console.log();

        for (const comment of comments) {
          console.log(chalk.cyan(`@${comment.author?.username || "unknown"}`));
          console.log(chalk.dim(`  ${new Date(comment.createdAt).toLocaleString()}`));
          console.log(`  ${comment.body}`);
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("labels")
    .description("List repository labels")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const labels = await apiGet<any[]>(
          `/api/repositories/${ownerIdentifier}/${name}/labels`
        );

        if (labels.length === 0) {
          console.log(chalk.yellow("No labels found"));
          return;
        }

        console.log(chalk.bold(`Labels (${labels.length})`));
        console.log();

        for (const label of labels) {
          console.log(`${chalk.hex(label.color || "#000000")("■")} ${label.name}`);
          if (label.description) {
            console.log(chalk.dim(`  ${label.description}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("label-add")
    .description("Add a label to an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .requiredOption("--label <name>", "Label name")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/labels`,
          {
            labelName: options.label,
          }
        );

        console.log(chalk.green(`✓ Label "${options.label}" added to issue #${options.number}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("label-remove")
    .description("Remove a label from an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .requiredOption("--label <name>", "Label name")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiDelete<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/labels/${options.label}`
        );

        console.log(chalk.green(`✓ Label "${options.label}" removed from issue #${options.number}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("assign")
    .description("Assign a user to an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .requiredOption("--user <username>", "Username to assign")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/assignees`,
          {
            username: options.user,
          }
        );

        console.log(chalk.green(`✓ Assigned @${options.user} to issue #${options.number}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  issues
    .command("unassign")
    .description("Unassign a user from an issue")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "Issue number")
    .requiredOption("--user <username>", "Username to unassign")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiDelete<any>(
          `/api/repositories/${ownerIdentifier}/${name}/issues/${options.number}/assignees/${options.user}`
        );

        console.log(chalk.green(`✓ Unassigned @${options.user} from issue #${options.number}`));
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
