import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  PrismaClient,
  ResourceType,
} from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

type SeedLesson = {
  title: string;
  description: string;
  duration: number;
};

type SeedTopic = {
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  lessons: SeedLesson[];
};

const topics: SeedTopic[] = [
  {
    slug: "programming-fundamentals",
    title: "Programming Fundamentals",
    description: "Build the mental models behind reliable software: data, control flow, functions, and problem solving.",
    estimatedHours: 18,
    lessons: [
      { title: "Values, variables, and types", description: "Understand how programs represent and transform information.", duration: 55 },
      { title: "Control flow and iteration", description: "Use conditions and loops to express decisions and repeated work.", duration: 60 },
      { title: "Functions and decomposition", description: "Break a problem into small, composable units.", duration: 70 },
    ],
  },
  {
    slug: "html",
    title: "HTML",
    description: "Write semantic, accessible document structures that work across devices and assistive technology.",
    estimatedHours: 8,
    lessons: [
      { title: "Semantic document structure", description: "Choose elements for meaning, not appearance.", duration: 45 },
      { title: "Forms and native controls", description: "Build accessible forms using the browser platform.", duration: 60 },
      { title: "Metadata and accessibility", description: "Improve navigation, search, and screen-reader support.", duration: 45 },
    ],
  },
  {
    slug: "modern-css",
    title: "Modern CSS",
    description: "Master resilient layouts, responsive systems, and the modern cascade.",
    estimatedHours: 16,
    lessons: [
      { title: "The cascade and custom properties", description: "Control inheritance and build reusable design tokens.", duration: 60 },
      { title: "Grid, flexbox, and intrinsic sizing", description: "Create layouts that respond to their content.", duration: 75 },
      { title: "Container queries and fluid type", description: "Design components that adapt wherever they are placed.", duration: 60 },
    ],
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description: "Deepen language fundamentals for predictable browser and server applications.",
    estimatedHours: 32,
    lessons: [
      { title: "Execution model and scope", description: "Understand closures, lexical scope, and the call stack.", duration: 75 },
      { title: "Objects, arrays, and immutability", description: "Model and transform application data safely.", duration: 70 },
      { title: "Promises and the event loop", description: "Reason clearly about asynchronous work.", duration: 85 },
    ],
  },
  {
    slug: "git",
    title: "Git",
    description: "Use version control confidently for focused, reviewable software changes.",
    estimatedHours: 10,
    lessons: [
      { title: "Commits as a thinking tool", description: "Create coherent changes with useful history.", duration: 45 },
      { title: "Branches, rebase, and merge", description: "Integrate parallel work without losing context.", duration: 65 },
      { title: "Recovering from mistakes", description: "Use reflog, restore, and revert safely.", duration: 55 },
    ],
  },
  {
    slug: "github",
    title: "GitHub",
    description: "Turn repositories into clear collaboration and portfolio artifacts.",
    estimatedHours: 10,
    lessons: [
      { title: "Repository foundations", description: "Create strong READMEs, issue templates, and project metadata.", duration: 45 },
      { title: "Pull requests and review", description: "Explain intent and make code easy to evaluate.", duration: 55 },
      { title: "Actions and release workflows", description: "Automate quality checks and reliable releases.", duration: 70 },
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description: "Model product domains precisely and make invalid states harder to represent.",
    estimatedHours: 28,
    lessons: [
      { title: "Type inference and narrowing", description: "Work with the compiler to safely refine unknown values.", duration: 70 },
      { title: "Generics in real components", description: "Build reusable APIs without losing useful type information.", duration: 80 },
      { title: "Domain modeling with unions", description: "Represent workflows with discriminated unions and exhaustive checks.", duration: 85 },
      { title: "Runtime validation with Zod", description: "Connect untrusted runtime input to static application types.", duration: 75 },
    ],
  },
  {
    slug: "react",
    title: "React",
    description: "Build understandable interfaces with composition, state, and modern rendering patterns.",
    estimatedHours: 32,
    lessons: [
      { title: "Rendering and component purity", description: "Understand React's model and avoid accidental effects.", duration: 75 },
      { title: "State architecture", description: "Place state where it belongs and derive everything else.", duration: 85 },
      { title: "Forms and optimistic interfaces", description: "Create responsive product workflows with clear feedback.", duration: 90 },
    ],
  },
  {
    slug: "nextjs",
    title: "Next.js",
    description: "Ship full-stack products with the App Router, server rendering, and deliberate data boundaries.",
    estimatedHours: 30,
    lessons: [
      { title: "App Router mental model", description: "Work confidently with layouts, routes, and server components.", duration: 80 },
      { title: "Data mutations and caching", description: "Keep reads fresh and writes predictable.", duration: 90 },
      { title: "Production observability", description: "Add error boundaries, instrumentation, and useful logs.", duration: 75 },
    ],
  },
  {
    slug: "nodejs",
    title: "Node.js",
    description: "Learn the runtime, modules, streams, and backend patterns behind modern JavaScript systems.",
    estimatedHours: 24,
    lessons: [
      { title: "Runtime and module system", description: "Understand Node's execution environment and package boundaries.", duration: 70 },
      { title: "HTTP and API design", description: "Build small, robust web services.", duration: 85 },
      { title: "Streams and background work", description: "Process data without unnecessary memory pressure.", duration: 80 },
    ],
  },
  {
    slug: "astro",
    title: "Astro",
    description: "Build content-focused experiences with islands and minimal client JavaScript.",
    estimatedHours: 14,
    lessons: [
      { title: "Content collections", description: "Model and render type-safe content.", duration: 60 },
      { title: "Islands architecture", description: "Add interactivity exactly where it is needed.", duration: 65 },
      { title: "Hybrid rendering", description: "Choose static or server output route by route.", duration: 60 },
    ],
  },
  {
    slug: "tailwindcss",
    title: "TailwindCSS",
    description: "Create consistent, maintainable UI quickly with a token-led utility workflow.",
    estimatedHours: 14,
    lessons: [
      { title: "Utility-first composition", description: "Build reusable interfaces without premature abstractions.", duration: 60 },
      { title: "Theme variables and tokens", description: "Connect utilities to a coherent visual system.", duration: 70 },
      { title: "Responsive component patterns", description: "Create adaptable UI with clear constraints.", duration: 65 },
    ],
  },
  {
    slug: "shadcn-ui",
    title: "shadcn/ui",
    description: "Own a high-quality component foundation and adapt it to product-specific needs.",
    estimatedHours: 12,
    lessons: [
      { title: "Component anatomy", description: "Understand Radix primitives, variants, and composition.", duration: 55 },
      { title: "Forms and validation", description: "Connect accessible controls to React Hook Form and Zod.", duration: 75 },
      { title: "Building a product vocabulary", description: "Turn primitives into consistent product patterns.", duration: 70 },
    ],
  },
  {
    slug: "design-systems",
    title: "Design Systems",
    description: "Design the rules, tokens, components, and governance that keep products coherent.",
    estimatedHours: 24,
    lessons: [
      { title: "Tokens and semantic color", description: "Create durable decisions below the component layer.", duration: 75 },
      { title: "Component API design", description: "Balance flexibility, consistency, and accessibility.", duration: 85 },
      { title: "Documentation and governance", description: "Help a system stay useful as teams and products evolve.", duration: 70 },
    ],
  },
  {
    slug: "figma",
    title: "Figma",
    description: "Improve interface craft, systems thinking, prototyping, and developer handoff.",
    estimatedHours: 18,
    lessons: [
      { title: "Variables and modes", description: "Model tokens and product themes directly in Figma.", duration: 65 },
      { title: "Advanced component properties", description: "Create flexible components with clear constraints.", duration: 70 },
      { title: "Prototyping AI workflows", description: "Explore interfaces before committing to implementation.", duration: 75 },
    ],
  },
  {
    slug: "ai-fundamentals",
    title: "AI Fundamentals",
    description: "Understand models, tokens, embeddings, evaluation, and the limits of probabilistic systems.",
    estimatedHours: 24,
    lessons: [
      { title: "How language models work", description: "Build a practical mental model of training and inference.", duration: 80 },
      { title: "Embeddings and retrieval", description: "Understand semantic search and context selection.", duration: 85 },
      { title: "Evaluation and failure modes", description: "Measure behavior and design around uncertainty.", duration: 90 },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description: "Design instructions and context that make AI behavior more reliable and testable.",
    estimatedHours: 20,
    lessons: [
      { title: "Instructions, context, and examples", description: "Structure prompts around the information models need.", duration: 70 },
      { title: "Tool use and structured output", description: "Connect model reasoning to safe product actions.", duration: 80 },
      { title: "Prompt evaluation", description: "Test prompt behavior against representative cases.", duration: 85 },
    ],
  },
  {
    slug: "ai-product-engineering",
    title: "AI Product Engineering",
    description: "Turn model capabilities into valuable, trustworthy, and observable product experiences.",
    estimatedHours: 48,
    lessons: [
      { title: "AI-native product discovery", description: "Find workflows where probabilistic interfaces create real leverage.", duration: 90 },
      { title: "Context engineering and RAG", description: "Deliver the right information to the model at the right time.", duration: 100 },
      { title: "Agents, tools, and MCP", description: "Design bounded autonomous workflows with clear control surfaces.", duration: 110 },
      { title: "Evals and production feedback", description: "Measure quality and learn from real-world behavior.", duration: 95 },
    ],
  },
  {
    slug: "english",
    title: "English",
    description: "Build daily confidence for international product work, interviews, and technical communication.",
    estimatedHours: 60,
    lessons: [
      { title: "Explain a technical decision", description: "Practice concise architecture explanations out loud.", duration: 30 },
      { title: "Product vocabulary in context", description: "Use high-value terms in realistic product conversations.", duration: 30 },
      { title: "Mock interview story", description: "Tell a clear story using situation, decision, and impact.", duration: 30 },
    ],
  },
];

async function main() {
  await prisma.missionTask.deleteMany();
  await prisma.dailyMission.deleteMany();
  await prisma.englishPractice.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.project.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.topic.deleteMany();

  const topicIds = new Map<string, number>();

  for (const [topicIndex, topic] of topics.entries()) {
    const created = await prisma.topic.create({
      data: {
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        estimatedHours: topic.estimatedHours,
        priority:
          {
            typescript: 100,
            react: 95,
            "ai-product-engineering": 95,
            nextjs: 90,
            nodejs: 85,
            "ai-fundamentals": 85,
            "prompt-engineering": 85,
            english: 80,
            github: 75,
          }[topic.slug] ?? 50,
        sortOrder: topicIndex,
        lessons: {
          create: topic.lessons.map((lesson, lessonIndex) => ({
            ...lesson,
            completed: false,
            sortOrder: lessonIndex,
          })),
        },
      },
    });

    topicIds.set(topic.slug, created.id);
  }

  const topicId = (slug: string) => {
    const id = topicIds.get(slug);
    if (!id) throw new Error(`Missing topic id for ${slug}`);
    return id;
  };

  await prisma.resource.createMany({
    data: [
      { topicId: topicId("typescript"), title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: ResourceType.DOCUMENTATION },
      { topicId: topicId("typescript"), title: "Generics: The Most Intimidating TypeScript Feature", url: "https://www.youtube.com/watch?v=dLPgQRbVquo", type: ResourceType.YOUTUBE },
      { topicId: topicId("typescript"), title: "TypeScript Crash Course with Matt Pocock", url: "https://learn.microsoft.com/en-us/shows/vs-code-livestreams/typescript-crash-course-with-matt-pocock", type: ResourceType.COURSE },
      { topicId: topicId("nextjs"), title: "Next.js App Router Documentation", url: "https://nextjs.org/docs/app", type: ResourceType.DOCUMENTATION },
      { topicId: topicId("nextjs"), title: "Next.js Learn: App Router", url: "https://nextjs.org/learn/dashboard-app", type: ResourceType.COURSE },
      { topicId: topicId("react"), title: "Thinking in React", url: "https://react.dev/learn/thinking-in-react", type: ResourceType.ARTICLE },
      { topicId: topicId("react"), title: "Your First Component", url: "https://react.dev/learn/your-first-component", type: ResourceType.DOCUMENTATION },
      { topicId: topicId("ai-fundamentals"), title: "Introduction to Large Language Models", url: "https://developers.google.com/machine-learning/resources/intro-llms", type: ResourceType.COURSE },
      { topicId: topicId("prompt-engineering"), title: "Prompt Engineering Guide", url: "https://www.promptingguide.ai/", type: ResourceType.COURSE },
      { topicId: topicId("ai-product-engineering"), title: "Introduction to Agents", url: "https://academy.openai.com/public/clubs/india-gkubq/videos/introduction-to-agents-2025-06-04", type: ResourceType.COURSE },
      { topicId: topicId("ai-product-engineering"), title: "Introduction to Agentic Workflows", url: "https://academy.openai.com/en/public/clubs/builders-etkn1/videos/unlock-agentic-power-with-the-agents-sdk", type: ResourceType.COURSE },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
