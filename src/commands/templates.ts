import { Command } from "commander";
import chalk from "chalk";

// Template data structures (mirrored from @gitbruv/lib)
type OrgType = "healthcare" | "research" | "company" | "education" | "nonprofit" | "generic";

type RepoTemplateFile = {
  path: string;
  content: string;
};

type RepoTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  orgType: OrgType;
  metadata: any;
  namingPattern: string;
  namingExample: string;
  initialFiles: RepoTemplateFile[];
};

// Healthcare Templates
const HEALTHCARE_TEMPLATES: RepoTemplate[] = [
  {
    id: "patient-record",
    name: "Patient Record",
    description: "FHIR-compliant patient medical record repository",
    icon: "User",
    orgType: "healthcare",
    metadata: {
      repoType: "patient-record",
      tags: ["patient", "medical-record"],
      domainData: {
        healthcare: {
          resourceType: "Patient",
          fhirVersion: "R4",
        },
      },
    },
    namingPattern: "patient-{name}",
    namingExample: "patient-john-doe",
    initialFiles: [],
  },
  {
    id: "fhir-resource",
    name: "FHIR Resource Collection",
    description: "Collection of FHIR resources (observations, conditions, etc.)",
    icon: "FileJson",
    orgType: "healthcare",
    metadata: {
      repoType: "fhir",
      tags: ["fhir", "resources"],
      domainData: {
        healthcare: {
          fhirVersion: "R4",
        },
      },
    },
    namingPattern: "fhir-{resource-type}",
    namingExample: "fhir-observations-2026",
    initialFiles: [],
  },
  {
    id: "medical-protocol",
    name: "Medical Protocol",
    description: "Clinical protocol or treatment guideline",
    icon: "FileText",
    orgType: "healthcare",
    metadata: {
      repoType: "protocol",
      tags: ["protocol", "guidelines"],
    },
    namingPattern: "protocol-{name}",
    namingExample: "protocol-diabetes-management",
    initialFiles: [],
  },
  {
    id: "clinical-study",
    name: "Clinical Study",
    description: "Clinical trial or research study data",
    icon: "FlaskConical",
    orgType: "healthcare",
    metadata: {
      repoType: "experiment",
      tags: ["clinical-trial", "research"],
    },
    namingPattern: "study-{name}",
    namingExample: "study-drug-efficacy-2026",
    initialFiles: [],
  },
];

// Research Templates
const RESEARCH_TEMPLATES: RepoTemplate[] = [
  {
    id: "research-dataset",
    name: "Research Dataset",
    description: "Versioned research dataset with metadata",
    icon: "Database",
    orgType: "research",
    metadata: {
      repoType: "dataset",
      tags: ["dataset", "data"],
    },
    namingPattern: "{topic}-dataset",
    namingExample: "climate-data-2026",
    initialFiles: [],
  },
  {
    id: "research-experiment",
    name: "Research Experiment",
    description: "Experimental study with methodology and results",
    icon: "FlaskConical",
    orgType: "research",
    metadata: {
      repoType: "experiment",
      tags: ["experiment", "study"],
    },
    namingPattern: "experiment-{name}",
    namingExample: "experiment-protein-analysis",
    initialFiles: [],
  },
  {
    id: "research-publication",
    name: "Research Publication",
    description: "Academic paper with LaTeX source and supplementary materials",
    icon: "BookOpen",
    orgType: "research",
    metadata: {
      repoType: "publication",
      tags: ["paper", "publication"],
    },
    namingPattern: "paper-{title}",
    namingExample: "paper-ml-genomics-2026",
    initialFiles: [],
  },
  {
    id: "research-analysis",
    name: "Data Analysis",
    description: "Statistical analysis and computational notebooks",
    icon: "TrendingUp",
    orgType: "research",
    metadata: {
      repoType: "analysis",
      tags: ["analysis", "statistics"],
    },
    namingPattern: "analysis-{topic}",
    namingExample: "analysis-gene-expression",
    initialFiles: [],
  },
];

// Company Templates
const COMPANY_TEMPLATES: RepoTemplate[] = [
  {
    id: "code-repository",
    name: "Code Repository",
    description: "Standard software project",
    icon: "Code",
    orgType: "company",
    metadata: {
      repoType: "code",
      tags: ["code", "software"],
    },
    namingPattern: "{project-name}",
    namingExample: "web-app",
    initialFiles: [],
  },
];

// Education Templates
const EDUCATION_TEMPLATES: RepoTemplate[] = [
  {
    id: "course-materials",
    name: "Course Materials",
    description: "Course curriculum and lecture materials",
    icon: "GraduationCap",
    orgType: "education",
    metadata: {
      repoType: "course",
      tags: ["course", "curriculum"],
    },
    namingPattern: "{course-code}-{title}",
    namingExample: "cs101-intro-programming",
    initialFiles: [],
  },
];

// Nonprofit Templates
const NONPROFIT_TEMPLATES: RepoTemplate[] = [
  {
    id: "campaign",
    name: "Campaign",
    description: "Fundraising or advocacy campaign materials",
    icon: "Megaphone",
    orgType: "nonprofit",
    metadata: {
      repoType: "campaign",
      tags: ["campaign", "advocacy"],
    },
    namingPattern: "campaign-{name}",
    namingExample: "campaign-clean-water-2026",
    initialFiles: [],
  },
];

// Template Registry
const REPO_TEMPLATES: Record<OrgType, RepoTemplate[]> = {
  healthcare: HEALTHCARE_TEMPLATES,
  research: RESEARCH_TEMPLATES,
  company: COMPANY_TEMPLATES,
  education: EDUCATION_TEMPLATES,
  nonprofit: NONPROFIT_TEMPLATES,
  generic: COMPANY_TEMPLATES,
};

/**
 * Get all available templates
 */
function getAllTemplates(): RepoTemplate[] {
  return Object.values(REPO_TEMPLATES).flat();
}

/**
 * Get templates for an organization type
 */
function getTemplatesForOrgType(orgType: OrgType | undefined | null): RepoTemplate[] {
  return REPO_TEMPLATES[orgType || "generic"] || COMPANY_TEMPLATES;
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): RepoTemplate | undefined {
  for (const templates of Object.values(REPO_TEMPLATES)) {
    const template = templates.find(t => t.id === templateId);
    if (template) return template;
  }
  return undefined;
}

/**
 * Get icon emoji for org type
 */
function getOrgTypeIcon(orgType: OrgType): string {
  const icons: Record<OrgType, string> = {
    healthcare: "🏥",
    research: "🔬",
    company: "🏢",
    education: "🎓",
    nonprofit: "🤝",
    generic: "📦",
  };
  return icons[orgType] || "📦";
}

export function createTemplatesCommand(): Command {
  const templates = new Command("templates").description(
    "Manage repository templates"
  );

  templates
    .command("list")
    .description("List available repository templates")
    .option("--org-type <type>", "Filter by organization type (healthcare, research, company, education, nonprofit)")
    .action((options) => {
      try {
        let templateList: RepoTemplate[];

        if (options.orgType) {
          const orgType = options.orgType as OrgType;
          if (!REPO_TEMPLATES[orgType]) {
            console.error(chalk.red(`Error: Invalid org type "${orgType}"`));
            console.log(chalk.dim("\nAvailable types: healthcare, research, company, education, nonprofit"));
            process.exit(1);
          }
          templateList = getTemplatesForOrgType(orgType);
          console.log(chalk.bold(`${getOrgTypeIcon(orgType)} ${orgType.charAt(0).toUpperCase() + orgType.slice(1)} Templates\n`));
        } else {
          templateList = getAllTemplates();
          console.log(chalk.bold("Available Repository Templates\n"));
        }

        if (templateList.length === 0) {
          console.log(chalk.yellow("No templates found"));
          return;
        }

        // Group by org type if showing all
        if (!options.orgType) {
          const grouped = templateList.reduce((acc, template) => {
            if (!acc[template.orgType]) {
              acc[template.orgType] = [];
            }
            acc[template.orgType].push(template);
            return acc;
          }, {} as Record<string, RepoTemplate[]>);

          for (const [orgType, templates] of Object.entries(grouped)) {
            console.log(chalk.bold(`${getOrgTypeIcon(orgType as OrgType)} ${orgType.charAt(0).toUpperCase() + orgType.slice(1)}`));
            for (const template of templates) {
              console.log(`  ${chalk.cyan(template.id.padEnd(25))} ${chalk.dim(template.name)}`);
              console.log(`  ${" ".repeat(25)} ${chalk.dim(template.description)}`);
            }
            console.log();
          }
        } else {
          // Just list the filtered templates
          for (const template of templateList) {
            console.log(`${chalk.cyan(template.id.padEnd(25))} ${chalk.dim(template.name)}`);
            console.log(`${" ".repeat(25)} ${chalk.dim(template.description)}`);
          }
        }

        console.log(chalk.dim("\nUse 'forge templates view <id>' to see details"));
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  templates
    .command("view")
    .description("View template details")
    .argument("<id>", "Template ID")
    .action((templateId: string) => {
      try {
        const template = getTemplateById(templateId);

        if (!template) {
          console.error(chalk.red(`Error: Template "${templateId}" not found`));
          console.log(chalk.dim("\nUse 'forge templates list' to see available templates"));
          process.exit(1);
        }

        console.log(chalk.bold(`${template.name}\n`));
        console.log(chalk.dim("ID:          ") + chalk.cyan(template.id));
        console.log(chalk.dim("Type:        ") + `${getOrgTypeIcon(template.orgType)} ${template.orgType}`);
        console.log(chalk.dim("Description: ") + template.description);
        console.log();

        console.log(chalk.bold("Naming Pattern"));
        console.log(chalk.dim("  Pattern:  ") + template.namingPattern);
        console.log(chalk.dim("  Example:  ") + chalk.cyan(template.namingExample));
        console.log();

        if (template.metadata) {
          console.log(chalk.bold("Metadata"));
          if (template.metadata.repoType) {
            console.log(chalk.dim("  Repo Type: ") + template.metadata.repoType);
          }
          if (template.metadata.tags && template.metadata.tags.length > 0) {
            console.log(chalk.dim("  Tags:      ") + template.metadata.tags.join(", "));
          }
          if (template.metadata.domainData) {
            console.log(chalk.dim("  Domain:    ") + JSON.stringify(template.metadata.domainData, null, 2).split('\n').join('\n             '));
          }
          console.log();
        }

        console.log(chalk.bold("Usage"));
        console.log(chalk.dim("  forge repos create --name ") + chalk.cyan(template.namingExample) + chalk.dim(" --template ") + chalk.cyan(template.id));
        console.log();

      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  return templates;
}
