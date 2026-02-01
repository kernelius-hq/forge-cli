# forge-cli Gap Analysis: UI vs CLI Capabilities

## Current CLI Commands (v0.1.4)

### Auth Commands ✅
- `login` - Authenticate with API key
- `logout` - Clear credentials
- `whoami` - Show current user
- `config` - Show configuration
- `signup` - Create account with agent

### Repository Commands (Partial ✅)
- `list` - List accessible repositories
- `view` - View repository details
- `clone` - Clone a repository
- `create` - Create new repository

### Issue Commands (Partial ✅)
- `list` - List issues
- `view` - View issue details
- `create` - Create new issue
- `close` - Close an issue
- `comment` - Add comment to issue

### Pull Request Commands (Partial ✅)
- `list` - List pull requests
- `view` - View PR details
- `create` - Create new PR
- `merge` - Merge a PR
- `close` - Close a PR
- `comment` - Add comment to PR

---

## Missing CLI Commands (from UI capabilities)

### Repository Operations ❌

#### Star/Unstar
- `repos star <repo>` - Star a repository
- `repos unstar <repo>` - Unstar a repository
- `repos stars` - List starred repositories
- `repos stargazers <repo>` - List users who starred a repo

#### Fork Operations
- `repos fork <repo>` - Fork a repository
- `repos forks <repo>` - List forks of a repository

#### Repository Management
- `repos edit <repo>` - Update repository details
  - `--name` - Rename repository
  - `--description` - Update description
  - `--visibility` - Change visibility (public/private)
- `repos delete <repo>` - Delete a repository
- `repos transfer <repo> --to <org>` - Transfer repository ownership

#### Repository Settings
- `repos visibility <repo> <public|private>` - Change visibility
- `repos default-branch <repo> <branch>` - Set default branch

---

### Issue Operations ❌

#### Issue Editing
- `issues edit <issue>` - Edit issue
  - `--title` - Update title
  - `--body` - Update body
  - `--state` - Change state
- `issues reopen <issue>` - Reopen a closed issue
- `issues delete <issue>` - Delete an issue
- `issues lock <issue>` - Lock an issue
- `issues unlock <issue>` - Unlock an issue

#### Labels
- `issues labels <repo>` - List repository labels
- `issues label create <repo> --name <name> --color <color>` - Create label
- `issues label edit <label>` - Edit label
- `issues label delete <label>` - Delete label
- `issues label add <issue> <label>` - Add label to issue
- `issues label remove <issue> <label>` - Remove label from issue

#### Assignees
- `issues assign <issue> <user>` - Assign user to issue
- `issues unassign <issue> <user>` - Unassign user from issue
- `issues assignees <issue>` - List issue assignees

#### Reactions
- `issues react <issue> <emoji>` - React to issue
- `issues unreact <issue> <emoji>` - Remove reaction
- `issues reactions <issue>` - List reactions

#### Comments
- `issues comments <issue>` - List comments
- `issues comment edit <comment-id> --body <text>` - Edit comment
- `issues comment delete <comment-id>` - Delete comment
- `issues comment react <comment-id> <emoji>` - React to comment

---

### Pull Request Operations ❌

#### PR Editing
- `prs edit <pr>` - Edit pull request
  - `--title` - Update title
  - `--body` - Update body
  - `--state` - Change state
- `prs reopen <pr>` - Reopen a closed PR
- `prs delete <pr>` - Delete a PR

#### Draft/Ready Status
- `prs draft <pr>` - Mark PR as draft
- `prs ready <pr>` - Mark PR as ready for review

#### Reviews
- `prs review <pr>` - Submit a review
  - `--approve` - Approve the PR
  - `--request-changes` - Request changes
  - `--comment` - Comment only
  - `--body <text>` - Review body
- `prs reviews <pr>` - List reviews

#### PR Labels & Assignees
- `prs label add <pr> <label>` - Add label to PR
- `prs label remove <pr> <label>` - Remove label from PR
- `prs assign <pr> <user>` - Assign user to PR
- `prs unassign <pr> <user>` - Unassign user from PR
- `prs request-review <pr> <user>` - Request review from user

#### PR Reactions
- `prs react <pr> <emoji>` - React to PR
- `prs unreact <pr> <emoji>` - Remove reaction

#### PR Comments
- `prs comments <pr>` - List comments
- `prs comment edit <comment-id> --body <text>` - Edit comment
- `prs comment delete <comment-id>` - Delete comment

#### PR Commits & Diff
- `prs commits <pr>` - List commits in PR
- `prs diff <pr>` - View PR diff
- `prs files <pr>` - List changed files

---

### Organization Operations ❌

#### Organization Management
- `orgs list` - List organizations
- `orgs view <org>` - View organization details
- `orgs create` - Create new organization
  - `--name` - Organization name
  - `--slug` - URL slug
  - `--description` - Description
- `orgs edit <org>` - Update organization
- `orgs delete <org>` - Delete organization

#### Organization Members
- `orgs members <org>` - List organization members
- `orgs member add <org> <user>` - Add member
- `orgs member remove <org> <user>` - Remove member
- `orgs member role <org> <user> <role>` - Change member role

#### Organization Teams
- `orgs teams <org>` - List teams
- `orgs team create <org> --name <name>` - Create team
- `orgs team delete <org> <team>` - Delete team
- `orgs team members <org> <team>` - List team members
- `orgs team add-member <org> <team> <user>` - Add member to team
- `orgs team remove-member <org> <team> <user>` - Remove member from team

#### Team Repository Access
- `orgs team repos <org> <team>` - List team repositories
- `orgs team grant <org> <team> <repo> <permission>` - Grant repo access
- `orgs team revoke <org> <team> <repo>` - Revoke repo access

#### Organization Invitations
- `orgs invite <org> <email>` - Invite user to organization
- `orgs invitations <org>` - List pending invitations
- `orgs invitation accept <invitation-id>` - Accept invitation
- `orgs invitation decline <invitation-id>` - Decline invitation

---

### User Operations ❌

#### Profile Management
- `user profile` - View current user profile
- `user profile edit` - Edit profile
  - `--name` - Display name
  - `--bio` - Bio/about
  - `--location` - Location
  - `--website` - Website URL
  - `--pronouns` - Pronouns
  - `--company` - Company name
  - `--git-email` - Git commit email
- `user avatar <image-path>` - Upload avatar

#### User Discovery
- `user search <query>` - Search for users
- `user view <username>` - View user profile
- `users list` - List public users

#### User Settings
- `user settings` - View settings
- `user settings visibility <public|private>` - Set default repo visibility
- `user settings word-wrap <on|off>` - Set word wrap preference

---

### Agent Operations ❌

#### Agent Management
- `agents list` - List user's agents
- `agents view <agent-id>` - View agent details
- `agents create` - Create new agent
  - `--name` - Agent name
  - `--username` - Agent username
  - `--emoji` - Agent emoji
- `agents edit <agent-id>` - Edit agent
- `agents delete <agent-id>` - Delete agent

#### Agent API Keys
- `agents keys <agent-id>` - List agent API keys
- `agents key create <agent-id> --name <name>` - Create API key
- `agents key delete <agent-id> <key-id>` - Delete API key

---

### Search Operations ❌

#### Global Search
- `search <query>` - Search across all resources
  - `--type <repo|issue|pr|user>` - Filter by type
  - `--limit <number>` - Limit results
- `search repos <query>` - Search repositories
- `search issues <query>` - Search issues
- `search prs <query>` - Search pull requests
- `search users <query>` - Search users

---

### Notification Operations ❌

#### Notifications
- `notifications list` - List notifications
  - `--unread` - Show only unread
- `notifications read <id>` - Mark notification as read
- `notifications read-all` - Mark all as read
- `notifications count` - Get unread count

---

### Discussion Operations ❌

#### Discussions
- `discussions list <repo>` - List discussions
- `discussions view <repo> <id>` - View discussion
- `discussions create <repo>` - Create discussion
  - `--title` - Discussion title
  - `--body` - Discussion body
  - `--category` - Category
- `discussions comment <repo> <id> --body <text>` - Add comment
- `discussions react <repo> <id> <emoji>` - React to discussion

---

### Collaboration Operations ❌

#### Collaboration
- `collab list <repo>` - List collaborators
- `collab add <repo> <user>` - Add collaborator
- `collab remove <repo> <user>` - Remove collaborator
- `collab permissions <repo> <user>` - View permissions

---

### Code Browsing Operations ❌

#### File Browsing
- `browse <repo> [path]` - Browse repository files
  - `--branch <branch>` - Specify branch
- `cat <repo> <file-path>` - View file contents
  - `--branch <branch>` - Specify branch
  - `--raw` - Show raw content

#### Commit History
- `commits <repo>` - List commits
  - `--branch <branch>` - Specify branch
  - `--limit <number>` - Limit results
- `commit <repo> <sha>` - View commit details

#### Branch Operations
- `branches <repo>` - List branches
- `branch <repo> <name>` - View branch details
- `branch create <repo> <name>` - Create branch
- `branch delete <repo> <name>` - Delete branch

---

## Priority Implementation Order

### Phase 1: Core Repository Features (High Priority) 🔥
1. `repos fork` - Fork repositories
2. `repos star` / `repos unstar` - Star functionality
3. `repos edit` - Edit repository details
4. `repos delete` - Delete repositories

### Phase 2: Enhanced Issue Management (High Priority) 🔥
1. `issues edit` - Edit issues
2. `issues reopen` - Reopen issues
3. `issues labels` - Label management
4. `issues assign` / `issues unassign` - Assignee management
5. `issues comments` - List comments

### Phase 3: Enhanced PR Management (High Priority) 🔥
1. `prs edit` - Edit pull requests
2. `prs reopen` - Reopen PRs
3. `prs draft` / `prs ready` - Draft status management
4. `prs review` - Submit reviews
5. `prs diff` - View PR diffs
6. `prs commits` - List PR commits

### Phase 4: Organization Support (Medium Priority) ⚡
1. `orgs list` / `orgs view` - Basic org operations
2. `orgs create` - Create organizations
3. `orgs members` - Member management
4. `orgs teams` - Team management

### Phase 5: User & Profile (Medium Priority) ⚡
1. `user profile` - View/edit profile
2. `user search` - Search users
3. `user view` - View other user profiles

### Phase 6: Code Browsing (Medium Priority) ⚡
1. `cat` - View file contents
2. `commits` - List commits
3. `branches` - List branches
4. `browse` - Browse files

### Phase 7: Advanced Features (Low Priority) 💡
1. Reactions support
2. Discussions
3. Notifications
4. Search operations
5. Collaborators

---

## Summary

**Total UI Features**: ~150+ distinct operations
**Current CLI Commands**: ~20 commands (13% coverage)
**Missing Commands**: ~130 commands (87% gap)

**Next Steps**:
1. Implement Phase 1 (Core Repository Features)
2. Implement Phase 2 (Enhanced Issue Management)
3. Implement Phase 3 (Enhanced PR Management)
4. Continue with remaining phases based on user needs

This gap analysis shows that while the CLI has basic CRUD operations for repos/issues/PRs, it's missing ~87% of the UI's capabilities. Priority should be given to the most commonly used features first.
