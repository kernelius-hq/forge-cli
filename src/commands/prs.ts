import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api.js";

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

        const result = await apiGet<{ pullRequests: any[]; hasMore: boolean }>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls?state=${options.state}`
        );

        const prsList = result.pullRequests || [];

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
            pr.merged ? "🟣" : pr.state === "open" ? "🟢" : "⚪";
          console.log(`${stateIcon} #${pr.number} ${chalk.cyan(pr.title)}`);
          console.log(
            chalk.dim(
              `   ${pr.headBranch} → ${pr.baseBranch} by @${pr.author?.username || "unknown"} · ${new Date(pr.createdAt).toLocaleDateString()}`
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
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        const stateIcon =
          pr.merged ? "🟣" : pr.state === "open" ? "🟢" : "⚪";
        console.log(`${stateIcon} ${chalk.bold(`#${pr.number} ${pr.title}`)}`);
        console.log(
          chalk.dim(
            `${pr.headBranch} → ${pr.baseBranch} by @${pr.author?.username || "unknown"} · ${new Date(pr.createdAt).toLocaleDateString()}`
          )
        );
        console.log();
        if (pr.body) {
          console.log(pr.body);
          console.log();
        }
        console.log(chalk.dim(`State: ${pr.merged ? "merged" : pr.state}`));
        if (pr.mergedAt) {
          console.log(
            chalk.dim(`Merged: ${new Date(pr.mergedAt).toLocaleDateString()}`)
          );
        }
        if (pr.closedAt && !pr.merged) {
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
          `/api/repositories/${ownerIdentifier}/${name}/pulls`,
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
    .option("--message <message>", "Custom merge commit message")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        // First get the PR to obtain its ID
        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPost<any>(`/api/pulls/${pr.id}/merge`, {
          commitMessage: options.message,
        });

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

        // First get the PR to obtain its ID
        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPatch<any>(`/api/pulls/${pr.id}`, {
          state: "closed",
        });

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

        // First get the PR to obtain its ID
        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPost<any>(`/api/pulls/${pr.id}/comments`, {
          body: options.body,
        });

        console.log(chalk.green("✓ Comment added successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("edit")
    .description("Edit a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .option("--title <title>", "New title")
    .option("--body <body>", "New body/description")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const updates: any = {};
        if (options.title) updates.title = options.title;
        if (options.body !== undefined) updates.body = options.body;

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow("No updates specified. Use --title or --body"));
          return;
        }

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPatch<any>(`/api/pulls/${pr.id}`, updates);

        console.log(chalk.green("✓ Pull request updated successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("reopen")
    .description("Reopen a closed pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPatch<any>(`/api/pulls/${pr.id}`, {
          state: "open",
        });

        console.log(chalk.green("✓ Pull request reopened successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("draft")
    .description("Mark pull request as draft")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPatch<any>(`/api/pulls/${pr.id}`, {
          draft: true,
        });

        console.log(chalk.green("✓ Pull request marked as draft"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("ready")
    .description("Mark pull request as ready for review")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        await apiPatch<any>(`/api/pulls/${pr.id}`, {
          draft: false,
        });

        console.log(chalk.green("✓ Pull request marked as ready for review"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("review")
    .description("Submit a review on a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .requiredOption("--state <state>", "Review state (approve/request_changes/comment)")
    .option("--body <body>", "Review comment")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        const validStates = ["approve", "request_changes", "comment"];
        if (!validStates.includes(options.state)) {
          console.log(chalk.red(`Invalid state. Must be one of: ${validStates.join(", ")}`));
          process.exit(1);
        }

        await apiPost<any>(`/api/pulls/${pr.id}/reviews`, {
          state: options.state,
          body: options.body || "",
        });

        const stateLabels: any = {
          approve: "approved",
          request_changes: "requested changes",
          comment: "commented",
        };

        console.log(chalk.green(`✓ Review submitted: ${stateLabels[options.state]}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("reviews")
    .description("List reviews on a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        const reviews = await apiGet<any[]>(`/api/pulls/${pr.id}/reviews`);

        if (reviews.length === 0) {
          console.log(chalk.yellow("No reviews found"));
          return;
        }

        console.log(chalk.bold(`Reviews (${reviews.length})`));
        console.log();

        for (const review of reviews) {
          const stateIcons: any = {
            approved: "✅",
            changes_requested: "🔄",
            commented: "💬",
          };
          const icon = stateIcons[review.state] || "•";

          console.log(
            `${icon} ${chalk.cyan(`@${review.author?.username || "unknown"}`)} ${chalk.dim(review.state)}`
          );
          console.log(chalk.dim(`   ${new Date(review.createdAt).toLocaleString()}`));
          if (review.body) {
            console.log(`   ${review.body}`);
          }
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("commits")
    .description("List commits in a pull request")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        const commits = await apiGet<any[]>(`/api/pulls/${pr.id}/commits`);

        if (commits.length === 0) {
          console.log(chalk.yellow("No commits found"));
          return;
        }

        console.log(chalk.bold(`Commits (${commits.length})`));
        console.log();

        for (const commit of commits) {
          console.log(chalk.cyan(commit.sha?.substring(0, 7) || "unknown"));
          console.log(`  ${commit.message || "(no message)"}`);
          console.log(
            chalk.dim(`  by ${commit.author?.name || "unknown"} on ${new Date(commit.createdAt).toLocaleDateString()}`)
          );
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  prs
    .command("diff")
    .description("View pull request diff")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--number <number>", "PR number")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const pr = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/pulls/${options.number}`
        );

        const diff = await apiGet<any>(`/api/pulls/${pr.id}/diff`);

        if (!diff || !diff.files || diff.files.length === 0) {
          console.log(chalk.yellow("No changes found"));
          return;
        }

        console.log(chalk.bold(`Diff for PR #${options.number}`));
        console.log();

        for (const file of diff.files) {
          console.log(chalk.cyan(`${file.path}`));
          console.log(
            chalk.dim(`  ${file.additions || 0} additions, ${file.deletions || 0} deletions`)
          );
        }

        console.log();
        console.log(
          chalk.dim(
            `Total: ${diff.additions || 0} additions, ${diff.deletions || 0} deletions across ${diff.files.length} files`
          )
        );
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
