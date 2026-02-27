import { defineCommand } from "citty";
import { createExecutor } from "../../executor";

const send = defineCommand({
  meta: {
    name: "send",
    description: "Send a mail message",
  },
  args: {
    to: { type: "string", description: "Recipient email address", required: true },
    subject: { type: "string", description: "Message subject", required: true },
    body: { type: "string", description: "Message body", required: true },
    cc: { type: "string", description: "CC recipients", default: "" },
    bcc: { type: "string", description: "BCC recipients", default: "" },
    html: { type: "boolean", description: "Send as HTML", default: false },
    attach: { type: "string", description: "Attachment paths (semicolon-separated)", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    // Convert WSL paths to Windows paths for attachments
    let attachPaths = "";
    if (args.attach) {
      const paths = args.attach.split(";").filter(Boolean);
      const winPaths: string[] = [];
      for (const p of paths) {
        const proc = Bun.spawn(["wslpath", "-w", p.trim()], { stdout: "pipe", stderr: "pipe" });
        const out = await new Response(proc.stdout).text();
        winPaths.push(out.trim());
      }
      attachPaths = winPaths.join(";");
    }

    const executor = await createExecutor();
    const result = await executor.execute("mail", "send-mail", {
      to: args.to,
      subject: args.subject,
      body: args.body,
      cc: args.cc,
      bcc: args.bcc,
      isHtml: args.html,
      attachPaths,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log(`Message sent to ${args.to}`);
    }
  },
});

export default send;
