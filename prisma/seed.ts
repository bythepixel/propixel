import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultVisualTemplate = await prisma.visualTemplate.upsert({
    where: { name: "Default proposal shell" },
    create: {
      name: "Default proposal shell",
      html: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{proposal_title}}</title>
    <style>
      body { margin:0; background:#f4f4f5; color:#18181b; font-family:Inter,system-ui,sans-serif; }
      .frame { max-width: 960px; margin: 32px auto; background: #fff; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; }
      header { background: linear-gradient(120deg,#111827,#1f2937); color: #fff; padding: 28px; }
      main { padding: 28px; }
      h1,h2,h3 { margin-top: 0; }
      section { margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th,td { text-align: left; border-bottom: 1px solid #e4e4e7; padding: 8px; font-size: 14px; }
      .small { color:#71717a; font-size: 12px; }
      @media (max-width: 768px) { .frame { margin: 0; border-radius: 0; } header,main { padding: 16px; } }
    </style>
    <style>{{visual_css}}</style>
  </head>
  <body>
    <div class="frame">
      <header>
        <h1 style="margin:0">{{proposal_title}}</h1>
        <p class="small" style="color:#d4d4d8;margin-top:8px">Rendered using Visual Template</p>
      </header>
      <main>
        {{proposal_content}}
      </main>
    </div>
    <script>window.PROPOSAL_DATA = {{proposal_json}};</script>
    <script>{{visual_js}}</script>
  </body>
</html>`,
      css: "",
      js: "",
    },
    update: {},
  });
  const passwordHash = await bcrypt.hash("password123", 10);

  const users: { email: string; name: string; role: Role }[] = [
    { email: "admin@demo.local", name: "Alex Admin", role: "ADMIN" },
    { email: "editor@demo.local", name: "Edie Editor", role: "EDITOR" },
    { email: "approver@demo.local", name: "Avery Approver", role: "APPROVER" },
    { email: "publisher@demo.local", name: "Pat Publisher", role: "PUBLISHER" },
    { email: "viewer@demo.local", name: "Vic Viewer", role: "VIEWER" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, passwordHash },
      update: { passwordHash, name: u.name, role: u.role },
    });
  }

  const categories = ["Services", "Process", "Legal", "Pricing"];
  const catRecords: Record<string, string> = {};
  for (const name of categories) {
    const c = await prisma.category.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    catRecords[name] = c.id;
  }

  const tagNames = ["website", "retainer", "discovery", "enterprise"];
  const tagRecords: Record<string, string> = {};
  for (const name of tagNames) {
    const t = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    tagRecords[name] = t.id;
  }

  const blocks = [
    {
      title: "Discovery overview",
      body: "We begin with a focused discovery workshop to align on goals, audiences, and success metrics.",
      usageGuidance: "Use for new engagements; swap metrics for the client industry.",
      sensitive: false,
      category: "Process",
      tags: ["discovery"],
    },
    {
      title: "Delivery timeline",
      body: "Weeks 1–2: discovery and UX. Weeks 3–6: design systems and build. Week 7: QA and launch.",
      usageGuidance: "Adjust week ranges for larger builds.",
      sensitive: false,
      category: "Process",
      tags: ["website"],
    },
    {
      title: "Standard MSA excerpt",
      body: "Payment terms: Net 30. Change requests may affect timeline and budget.",
      usageGuidance: "Legal review required before sending; pair with full MSA.",
      sensitive: true,
      category: "Legal",
      tags: ["retainer"],
    },
    {
      title: "Website build — indicative pricing",
      body: "Indicative range: scoped after discovery. Detailed line items appear in the pricing table.",
      usageGuidance: "Keep high-level; put numbers only in the pricing table.",
      sensitive: true,
      category: "Pricing",
      tags: ["website", "enterprise"],
    },
  ];

  for (const b of blocks) {
    const existing = await prisma.contentBlock.findFirst({
      where: { title: b.title },
    });
    const data = {
      title: b.title,
      body: b.body,
      usageGuidance: b.usageGuidance,
      sensitive: b.sensitive,
      categoryId: catRecords[b.category],
      tags: {
        create: b.tags.map((name) => ({ tagId: tagRecords[name] })),
      },
    };
    if (existing) {
      await prisma.contentBlockTag.deleteMany({ where: { blockId: existing.id } });
      await prisma.contentBlock.update({
        where: { id: existing.id },
        data: {
          body: data.body,
          usageGuidance: data.usageGuidance,
          sensitive: data.sensitive,
          categoryId: data.categoryId,
          tags: data.tags,
        },
      });
    } else {
      await prisma.contentBlock.create({ data });
    }
  }

  const discoveryBlock = await prisma.contentBlock.findFirstOrThrow({
    where: { title: "Discovery overview" },
  });
  const timelineBlock = await prisma.contentBlock.findFirstOrThrow({
    where: { title: "Delivery timeline" },
  });
  const legalBlock = await prisma.contentBlock.findFirstOrThrow({
    where: { title: "Standard MSA excerpt" },
  });

  let tpl = await prisma.template.findFirst({ where: { name: "Website build" } });
  if (!tpl) {
    tpl = await prisma.template.create({
      data: {
        name: "Website build",
        description: "Default sections for a typical website proposal.",
        visualTemplateId: defaultVisualTemplate.id,
        sections: {
          create: [
            { order: 0, sectionTitle: "Discovery", defaultBlockId: discoveryBlock.id },
            { order: 1, sectionTitle: "Delivery", defaultBlockId: timelineBlock.id },
            { order: 2, sectionTitle: "Legal", defaultBlockId: legalBlock.id },
          ],
        },
      },
    });
  } else {
    await prisma.template.update({
      where: { id: tpl.id },
      data: { visualTemplateId: tpl.visualTemplateId ?? defaultVisualTemplate.id },
    });
  }

  console.log("Seed complete. Log in with any *@demo.local user / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
