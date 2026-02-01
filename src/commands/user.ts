import { Command } from "commander";
import chalk from "chalk";
import { apiGet, apiPost, apiPatch } from "../api.js";

export function createUserCommand(): Command {
  const user = new Command("user").description("Manage user profile and settings");

  user
    .command("profile")
    .description("View user profile")
    .argument("[username]", "Username (defaults to current user)")
    .action(async (username?: string) => {
      try {
        let profile: any;

        if (username) {
          profile = await apiGet<any>(`/api/users/${username}`);
        } else {
          profile = await apiGet<any>("/api/users/me");
        }

        console.log(chalk.bold(`@${profile.username}`));
        if (profile.name) {
          console.log(chalk.dim(profile.name));
        }
        console.log();

        if (profile.bio) {
          console.log(profile.bio);
          console.log();
        }

        if (profile.location) {
          console.log(chalk.dim(`📍 ${profile.location}`));
        }
        if (profile.website) {
          console.log(chalk.dim(`🔗 ${profile.website}`));
        }
        if (profile.company) {
          console.log(chalk.dim(`🏢 ${profile.company}`));
        }
        if (profile.pronouns) {
          console.log(chalk.dim(`Pronouns: ${profile.pronouns}`));
        }
        if (profile.gitEmail) {
          console.log(chalk.dim(`Git Email: ${profile.gitEmail}`));
        }

        console.log();
        console.log(chalk.dim(`User type: ${profile.userType || "human"}`));
        console.log(chalk.dim(`Joined: ${new Date(profile.createdAt).toLocaleDateString()}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  user
    .command("edit")
    .description("Edit your profile")
    .option("--name <name>", "Display name")
    .option("--bio <bio>", "Bio/about")
    .option("--location <location>", "Location")
    .option("--website <url>", "Website URL")
    .option("--pronouns <pronouns>", "Pronouns")
    .option("--company <company>", "Company name")
    .option("--git-email <email>", "Git commit email")
    .action(async (options) => {
      try {
        const updates: any = {};
        if (options.name !== undefined) updates.name = options.name;
        if (options.bio !== undefined) updates.bio = options.bio;
        if (options.location !== undefined) updates.location = options.location;
        if (options.website !== undefined) updates.website = options.website;
        if (options.pronouns !== undefined) updates.pronouns = options.pronouns;
        if (options.company !== undefined) updates.company = options.company;
        if (options.gitEmail !== undefined) updates.gitEmail = options.gitEmail;

        if (Object.keys(updates).length === 0) {
          console.log(
            chalk.yellow(
              "No updates specified. Use --name, --bio, --location, --website, --pronouns, --company, or --git-email"
            )
          );
          return;
        }

        await apiPatch<any>("/api/settings/profile", updates);

        console.log(chalk.green("✓ Profile updated successfully"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  user
    .command("search")
    .description("Search for users")
    .argument("<query>", "Search query")
    .option("--limit <number>", "Limit results", "10")
    .action(async (query: string, options) => {
      try {
        const results = await apiGet<any>(
          `/api/search?q=${encodeURIComponent(query)}&type=users&limit=${options.limit}`
        );

        const users = results.users || [];

        if (users.length === 0) {
          console.log(chalk.yellow("No users found"));
          return;
        }

        console.log(chalk.bold(`Users (${users.length})`));
        console.log();

        for (const u of users) {
          console.log(chalk.cyan(`@${u.username}`));
          if (u.name) {
            console.log(chalk.dim(`  ${u.name}`));
          }
          if (u.bio) {
            const shortBio = u.bio.length > 60 ? u.bio.substring(0, 60) + "..." : u.bio;
            console.log(chalk.dim(`  ${shortBio}`));
          }
          console.log();
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  user
    .command("repos")
    .description("List user repositories")
    .argument("[username]", "Username (defaults to current user)")
    .action(async (username?: string) => {
      try {
        let targetUsername: string;

        if (username) {
          targetUsername = username;
        } else {
          const me = await apiGet<any>("/api/users/me");
          targetUsername = me.username;
        }

        const result = await apiGet<{ repos: any[] }>(
          `/api/repositories/user/${targetUsername}`
        );

        const repositories = result.repos || [];

        if (repositories.length === 0) {
          console.log(chalk.yellow(`No repositories found for @${targetUsername}`));
          return;
        }

        console.log(chalk.bold(`@${targetUsername}'s Repositories (${repositories.length})`));
        console.log();

        for (const repo of repositories) {
          const visibility = repo.visibility === "private" ? "🔒" : "🌐";
          console.log(`${visibility} ${chalk.cyan(repo.name)}`);
          if (repo.description) {
            console.log(chalk.dim(`   ${repo.description}`));
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return user;
}
