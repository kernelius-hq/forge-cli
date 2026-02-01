import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api.js";

export function createOrgsCommand(): Command {
  const orgs = new Command("orgs")
    .alias("org")
    .description("Manage organizations");

  orgs
    .command("list")
    .description("List organizations")
    .option("--member", "Show only organizations you're a member of")
    .action(async (options) => {
      try {
        let organizations: any[];

        if (options.member) {
          const user = await apiGet<any>("/api/users/me");
          const result = await apiGet<{ organizations: any[] }>(
            `/api/users/${user.id}/organizations`
          );
          organizations = result.organizations || [];
        } else {
          organizations = await apiGet<any[]>("/api/organizations");
        }

        if (organizations.length === 0) {
          console.log(chalk.yellow("No organizations found"));
          return;
        }

        console.log(chalk.bold(`Organizations (${organizations.length})`));
        console.log();

        for (const org of organizations) {
          console.log(chalk.cyan(`@${org.slug}`));
          console.log(chalk.dim(`  ${org.name}`));
          if (org.metadata?.description) {
            console.log(chalk.dim(`  ${org.metadata.description}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("view")
    .description("View organization details")
    .argument("<slug>", "Organization slug")
    .action(async (slug: string) => {
      try {
        const org = await apiGet<any>(`/api/organizations/${slug}`);

        console.log(chalk.bold(`@${org.slug}`));
        console.log(chalk.dim(org.name));
        console.log();

        if (org.metadata?.description) {
          console.log(org.metadata.description);
          console.log();
        }

        console.log(chalk.dim(`Created: ${new Date(org.createdAt).toLocaleDateString()}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("create")
    .description("Create a new organization")
    .requiredOption("--name <name>", "Organization name")
    .requiredOption("--slug <slug>", "Organization slug (URL identifier)")
    .option("--description <desc>", "Organization description")
    .action(async (options) => {
      try {
        const org = await apiPost<any>("/api/organizations", {
          name: options.name,
          slug: options.slug,
          metadata: options.description
            ? { description: options.description }
            : undefined,
        });

        console.log(chalk.green("✓ Organization created successfully"));
        console.log(chalk.dim(`  @${org.slug}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("members")
    .description("List organization members")
    .argument("<slug>", "Organization slug")
    .action(async (slug: string) => {
      try {
        const members = await apiGet<any[]>(`/api/organizations/${slug}/members`);

        if (members.length === 0) {
          console.log(chalk.yellow("No members found"));
          return;
        }

        console.log(chalk.bold(`Members (${members.length})`));
        console.log();

        for (const member of members) {
          const roleIcon = member.role === "owner" ? "👑" : member.role === "admin" ? "⚡" : "•";
          console.log(`${roleIcon} ${chalk.cyan(`@${member.user?.username || "unknown"}`)} ${chalk.dim(member.role)}`);
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("member-add")
    .description("Add a member to organization")
    .argument("<slug>", "Organization slug")
    .argument("<username>", "Username to add")
    .option("--role <role>", "Member role (owner/admin/member)", "member")
    .action(async (slug: string, username: string, options) => {
      try {
        await apiPost<any>(`/api/organizations/${slug}/members`, {
          username,
          role: options.role,
        });

        console.log(chalk.green(`✓ Added @${username} to @${slug} as ${options.role}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("member-remove")
    .description("Remove a member from organization")
    .argument("<slug>", "Organization slug")
    .argument("<username>", "Username to remove")
    .action(async (slug: string, username: string) => {
      try {
        await apiDelete<any>(`/api/organizations/${slug}/members/${username}`);

        console.log(chalk.green(`✓ Removed @${username} from @${slug}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("teams")
    .description("List organization teams")
    .argument("<slug>", "Organization slug")
    .action(async (slug: string) => {
      try {
        const teams = await apiGet<any[]>(`/api/organizations/${slug}/teams`);

        if (teams.length === 0) {
          console.log(chalk.yellow("No teams found"));
          return;
        }

        console.log(chalk.bold(`Teams (${teams.length})`));
        console.log();

        for (const team of teams) {
          console.log(chalk.cyan(team.name));
          if (team.description) {
            console.log(chalk.dim(`  ${team.description}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("team-create")
    .description("Create a team in organization")
    .argument("<slug>", "Organization slug")
    .requiredOption("--name <name>", "Team name")
    .option("--description <desc>", "Team description")
    .action(async (slug: string, options) => {
      try {
        const team = await apiPost<any>(`/api/organizations/${slug}/teams`, {
          name: options.name,
          description: options.description,
        });

        console.log(chalk.green(`✓ Team "${team.name}" created in @${slug}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("team-members")
    .description("List team members")
    .argument("<slug>", "Organization slug")
    .argument("<team>", "Team name")
    .action(async (slug: string, team: string) => {
      try {
        const members = await apiGet<any[]>(
          `/api/organizations/${slug}/teams/${team}/members`
        );

        if (members.length === 0) {
          console.log(chalk.yellow("No team members found"));
          return;
        }

        console.log(chalk.bold(`Team Members (${members.length})`));
        console.log();

        for (const member of members) {
          console.log(chalk.cyan(`@${member.user?.username || "unknown"}`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("team-add-member")
    .description("Add a member to team")
    .argument("<slug>", "Organization slug")
    .argument("<team>", "Team name")
    .argument("<username>", "Username to add")
    .action(async (slug: string, team: string, username: string) => {
      try {
        await apiPost<any>(
          `/api/organizations/${slug}/teams/${team}/members`,
          {
            username,
          }
        );

        console.log(chalk.green(`✓ Added @${username} to team ${team}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  orgs
    .command("team-remove-member")
    .description("Remove a member from team")
    .argument("<slug>", "Organization slug")
    .argument("<team>", "Team name")
    .argument("<username>", "Username to remove")
    .action(async (slug: string, team: string, username: string) => {
      try {
        await apiDelete<any>(
          `/api/organizations/${slug}/teams/${team}/members/${username}`
        );

        console.log(chalk.green(`✓ Removed @${username} from team ${team}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return orgs;
}
