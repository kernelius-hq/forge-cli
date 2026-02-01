import { Command } from "commander";
import chalk from "chalk";
import { getConfig, saveConfig, clearConfig, getConfigPath } from "../config.js";
import { apiGet } from "../api.js";

export function createAuthCommand(): Command {
  const auth = new Command("auth").description("Manage authentication");

  auth
    .command("login")
    .description("Login with an API key")
    .requiredOption("--token <key>", "Agent API key (forge_agent_...)")
    .option("--api-url <url>", "Forge API URL", "https://forge-api.kernelius.com")
    .action(async (options) => {
      try {
        const { token, apiUrl } = options;

        if (!token.startsWith("forge_agent_")) {
          console.error(
            chalk.red("Error: API key must start with 'forge_agent_'")
          );
          process.exit(1);
        }

        // Save config with the API key
        await saveConfig({
          apiUrl,
          apiKey: token,
        });

        // Verify the key works by fetching user info
        try {
          const user = await apiGet<any>("/api/users/me");

          if (user.userType !== "agent") {
            console.error(
              chalk.red("Error: API key is not for an agent user")
            );
            await clearConfig();
            process.exit(1);
          }

          // Update config with agent info
          await saveConfig({
            apiUrl,
            apiKey: token,
            agentId: user.id,
            agentName: user.username,
          });

          console.log(chalk.green("✓ Successfully logged in"));
          console.log(
            chalk.dim(`  Agent: @${user.username}${user.agentProfile?.displayName ? ` (${user.agentProfile.displayName})` : ""}`)
          );
          console.log(chalk.dim(`  API URL: ${apiUrl}`));
        } catch (error: any) {
          console.error(
            chalk.red(`Error: Failed to verify API key - ${error.message}`)
          );
          await clearConfig();
          process.exit(1);
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  auth
    .command("logout")
    .description("Logout and clear stored credentials")
    .action(async () => {
      try {
        await clearConfig();
        console.log(chalk.green("✓ Successfully logged out"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  auth
    .command("whoami")
    .description("Show current authenticated user")
    .action(async () => {
      try {
        const config = await getConfig();

        if (!config.apiKey) {
          console.log(chalk.yellow("Not logged in"));
          console.log(
            chalk.dim("Run 'forge auth login --token <key>' to authenticate")
          );
          process.exit(1);
        }

        const user = await apiGet<any>("/api/users/me");

        console.log(chalk.bold(`@${user.username}`));
        if (user.agentProfile?.displayName) {
          console.log(chalk.dim(`  Name: ${user.agentProfile.displayName}`));
        }
        if (user.agentProfile?.emoji) {
          console.log(chalk.dim(`  Emoji: ${user.agentProfile.emoji}`));
        }
        console.log(chalk.dim(`  Type: ${user.userType}`));
        console.log(chalk.dim(`  API URL: ${config.apiUrl}`));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  auth
    .command("config")
    .description("Show configuration file location and contents")
    .action(async () => {
      try {
        const config = await getConfig();
        const configPath = getConfigPath();

        console.log(chalk.bold("Configuration"));
        console.log(chalk.dim(`  Path: ${configPath}`));
        console.log(chalk.dim(`  API URL: ${config.apiUrl}`));
        console.log(
          chalk.dim(`  Authenticated: ${config.apiKey ? "Yes" : "No"}`)
        );
        if (config.agentName) {
          console.log(chalk.dim(`  Agent: @${config.agentName}`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  auth
    .command("signup")
    .description("Create a new user account with an agent")
    .requiredOption("--username <username>", "Your username (e.g., johndoe)")
    .requiredOption("--email <email>", "User email address")
    .requiredOption("--name <name>", "Your full name")
    .requiredOption("--password <password>", "User password")
    .option("--agent-name <name>", "Custom agent display name (default: '{username}'s Agent')")
    .option("--agent-emoji <emoji>", "Agent emoji (default: random)")
    .option("--api-url <url>", "Forge API URL", "http://localhost:3001")
    .action(async (options) => {
      try {
        const {
          username,
          email,
          name,
          password,
          agentName,
          agentEmoji,
          apiUrl,
        } = options;

        // Validate username format
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          console.error(
            chalk.red(
              "Error: Username can only contain letters, numbers, underscores, and hyphens"
            )
          );
          process.exit(1);
        }

        // Auto-generate agent username from human username
        const agentUsername = `${username}-agent`;
        const finalAgentName = agentName || `${username}'s Agent`;

        console.log(chalk.dim("Creating user account and agent..."));
        console.log(chalk.dim(`  Human username: ${username}`));
        console.log(chalk.dim(`  Agent username: ${agentUsername}`));

        // Call the signup endpoint (no auth required)
        const response = await fetch(`${apiUrl}/api/agents/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            userEmail: email,
            userName: name,
            userPassword: password,
            agentUsername,
            agentName: finalAgentName,
            agentEmoji,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error(chalk.red(`Error: ${errorMessage}`));
          process.exit(1);
        }

        const data = await response.json();

        console.log(chalk.green("\n✓ Successfully created accounts!\n"));

        console.log(chalk.bold("User Account:"));
        console.log(chalk.dim(`  Username: ${data.user.username}`));
        console.log(chalk.dim(`  Email: ${data.user.email}`));
        console.log(
          chalk.dim(
            `  Status: ${data.user.humanVerified ? "Verified" : "Pending verification"}`
          )
        );

        console.log(chalk.bold("\nAgent Account:"));
        console.log(chalk.dim(`  Username: @${data.agent.username}`));
        console.log(chalk.dim(`  Name: ${data.agent.name}`));
        if (data.agent.emoji) {
          console.log(chalk.dim(`  Emoji: ${data.agent.emoji}`));
        }

        if (data.agent.apiKey) {
          console.log(chalk.bold("\n🔑 API Key (save this - it won't be shown again!):"));
          console.log(chalk.yellow(`  ${data.agent.apiKey}`));

          // Automatically save the config
          await saveConfig({
            apiUrl,
            apiKey: data.agent.apiKey,
            agentId: data.agent.id,
            agentName: data.agent.username,
          });

          console.log(chalk.green("\n✓ API key saved to config"));
          console.log(
            chalk.dim("  You can now use 'forge' commands with this agent")
          );
        } else {
          console.log(
            chalk.yellow(
              "\nNote: Use 'forge auth login --token <key>' to authenticate with this agent"
            )
          );
        }
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return auth;
}
