import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api.js";

export function createWebhooksCommand(): Command {
  const webhooks = new Command("webhooks")
    .alias("webhook")
    .description("Manage repository webhooks");

  webhooks
    .command("list")
    .description("List webhooks for a repository")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const result = await apiGet<{ webhooks: any[] }>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks`
        );

        const webhookList = result.webhooks || [];

        if (webhookList.length === 0) {
          console.log(chalk.yellow("No webhooks found"));
          return;
        }

        console.log(chalk.bold(`Webhooks (${webhookList.length})`));
        console.log();

        for (const webhook of webhookList) {
          const statusIcon = webhook.active ? "🟢" : "⚪";
          console.log(`${statusIcon} ${chalk.cyan(webhook.name || webhook.id)}`);
          console.log(chalk.dim(`   URL: ${webhook.url}`));
          console.log(chalk.dim(`   Events: ${(webhook.events || []).join(", ")}`));
          if (webhook.lastTriggeredAt) {
            console.log(chalk.dim(`   Last triggered: ${new Date(webhook.lastTriggeredAt).toLocaleString()}`));
          }
          if (webhook.failureCount > 0) {
            console.log(chalk.yellow(`   Failures: ${webhook.failureCount}`));
          }
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("view")
    .description("View webhook details")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const webhook = await apiGet<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}`
        );

        const statusIcon = webhook.active ? "🟢 Active" : "⚪ Inactive";
        console.log(chalk.bold(webhook.name || `Webhook ${webhook.id}`));
        console.log(chalk.dim(`Status: ${statusIcon}`));
        console.log();
        console.log(`URL: ${chalk.cyan(webhook.url)}`);
        console.log(`Secret: ${chalk.dim(webhook.secret)}`);
        console.log();
        console.log(chalk.bold("Events:"));
        for (const event of webhook.events || []) {
          console.log(`  • ${event}`);
        }
        console.log();
        if (webhook.description) {
          console.log(`Description: ${webhook.description}`);
        }
        console.log(chalk.dim(`Created: ${new Date(webhook.createdAt).toLocaleString()}`));
        if (webhook.lastTriggeredAt) {
          console.log(chalk.dim(`Last triggered: ${new Date(webhook.lastTriggeredAt).toLocaleString()}`));
        }
        if (webhook.lastSuccessAt) {
          console.log(chalk.green(`Last success: ${new Date(webhook.lastSuccessAt).toLocaleString()}`));
        }
        if (webhook.lastFailureAt) {
          console.log(chalk.yellow(`Last failure: ${new Date(webhook.lastFailureAt).toLocaleString()}`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("create")
    .description("Create a new webhook")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--url <url>", "Webhook URL to receive events")
    .requiredOption("--events <events>", "Comma-separated list of events to listen for")
    .option("--name <name>", "Friendly name for the webhook")
    .option("--description <desc>", "Description of the webhook")
    .option("--inactive", "Create webhook as inactive")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const events = options.events.split(",").map((e: string) => e.trim());

        const webhook = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks`,
          {
            url: options.url,
            events,
            webhookName: options.name,
            description: options.description,
            active: !options.inactive,
          }
        );

        console.log(chalk.green("✓ Webhook created successfully"));
        console.log();
        console.log(`ID: ${chalk.cyan(webhook.id)}`);
        console.log(`URL: ${webhook.url}`);
        console.log(`Events: ${events.join(", ")}`);
        console.log();
        console.log(chalk.bold.yellow("⚠️  Save this secret - it will only be shown once:"));
        console.log(chalk.cyan(webhook.secretFull));
        console.log();
        console.log(chalk.dim("Use this secret to verify webhook signatures (X-Forge-Signature header)"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("update")
    .description("Update a webhook")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .option("--url <url>", "New URL")
    .option("--events <events>", "New comma-separated list of events")
    .option("--name <name>", "New name")
    .option("--description <desc>", "New description")
    .option("--active", "Enable webhook")
    .option("--inactive", "Disable webhook")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const updates: any = {};
        if (options.url) updates.url = options.url;
        if (options.events) updates.events = options.events.split(",").map((e: string) => e.trim());
        if (options.name !== undefined) updates.name = options.name;
        if (options.description !== undefined) updates.description = options.description;
        if (options.active) updates.active = true;
        if (options.inactive) updates.active = false;

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow("No updates specified"));
          return;
        }

        await apiPatch<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}`,
          updates
        );

        console.log(chalk.green("✓ Webhook updated successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("delete")
    .description("Delete a webhook")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        await apiDelete<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}`
        );

        console.log(chalk.green("✓ Webhook deleted successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("test")
    .description("Send a test ping to a webhook")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        console.log(chalk.dim("Sending test ping..."));

        const result = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}/test`,
          {}
        );

        if (result.success) {
          console.log(chalk.green("✓ Webhook test successful"));
          console.log(chalk.dim(`  Status: ${result.delivery.statusCode}`));
          console.log(chalk.dim(`  Duration: ${result.delivery.duration}ms`));
        } else {
          console.log(chalk.red("✗ Webhook test failed"));
          if (result.delivery.statusCode) {
            console.log(chalk.dim(`  Status: ${result.delivery.statusCode}`));
          }
          if (result.delivery.error) {
            console.log(chalk.dim(`  Error: ${result.delivery.error}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("deliveries")
    .description("List recent webhook deliveries")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .option("--limit <n>", "Number of deliveries to show", "20")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const result = await apiGet<{ deliveries: any[] }>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}/deliveries?limit=${options.limit}`
        );

        const deliveries = result.deliveries || [];

        if (deliveries.length === 0) {
          console.log(chalk.yellow("No deliveries found"));
          return;
        }

        console.log(chalk.bold(`Recent Deliveries (${deliveries.length})`));
        console.log();

        for (const delivery of deliveries) {
          const statusIcon = delivery.success ? "✓" : "✗";
          const statusColor = delivery.success ? chalk.green : chalk.red;

          console.log(statusColor(`${statusIcon} ${delivery.event}`));
          console.log(chalk.dim(`   ${new Date(delivery.deliveredAt).toLocaleString()}`));
          if (delivery.statusCode) {
            console.log(chalk.dim(`   Status: ${delivery.statusCode} · ${delivery.duration}ms`));
          }
          if (delivery.error) {
            console.log(chalk.yellow(`   Error: ${delivery.error}`));
          }
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("regenerate-secret")
    .description("Regenerate webhook secret")
    .requiredOption("--repo <repo>", "Repository (@owner/name)")
    .requiredOption("--id <id>", "Webhook ID")
    .action(async (options) => {
      try {
        const [ownerIdentifier, name] = parseRepoArg(options.repo);

        const result = await apiPost<any>(
          `/api/repositories/${ownerIdentifier}/${name}/webhooks/${options.id}/regenerate-secret`,
          {}
        );

        console.log(chalk.green("✓ Secret regenerated successfully"));
        console.log();
        console.log(chalk.bold.yellow("⚠️  Save this new secret - it will only be shown once:"));
        console.log(chalk.cyan(result.secretFull));
        console.log();
        console.log(chalk.dim("Update your webhook receiver to use this new secret"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  webhooks
    .command("events")
    .description("List available webhook event types")
    .action(() => {
      console.log(chalk.bold("Available Webhook Events"));
      console.log();

      const events = [
        { name: "issue.created", desc: "New issue opened" },
        { name: "issue.updated", desc: "Issue title or body changed" },
        { name: "issue.closed", desc: "Issue closed" },
        { name: "issue.reopened", desc: "Issue reopened" },
        { name: "issue.commented", desc: "New comment on issue" },
        { name: "pr.created", desc: "Pull request opened" },
        { name: "pr.updated", desc: "PR title/body changed" },
        { name: "pr.merged", desc: "PR merged" },
        { name: "pr.closed", desc: "PR closed without merging" },
        { name: "pr.review_requested", desc: "Review requested on PR" },
        { name: "pr.reviewed", desc: "PR review submitted" },
        { name: "pr.commented", desc: "New comment on PR" },
        { name: "push", desc: "Commits pushed to branch" },
        { name: "repo.created", desc: "Repository created" },
        { name: "repo.deleted", desc: "Repository deleted" },
      ];

      for (const event of events) {
        console.log(`  ${chalk.cyan(event.name.padEnd(22))} ${chalk.dim(event.desc)}`);
      }

      console.log();
      console.log(chalk.dim("Use comma-separated list with --events flag:"));
      console.log(chalk.dim("  forge webhooks create --events issue.created,pr.created ..."));
    });

  return webhooks;
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
