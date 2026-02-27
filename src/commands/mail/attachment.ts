import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { resolveId } from "../../lib/id-cache";
import { homedir } from "os";
import type { AttachmentInfo } from "../../types/mail";

const attachment = defineCommand({
  meta: {
    name: "attachment",
    description: "Download or list attachments",
  },
  args: {
    id: { type: "positional", description: "Message index or EntryID", required: true },
    index: { type: "string", description: "Attachment index (1-based)", default: "1" },
    "save-to": { type: "string", description: "Directory to save attachment", default: "" },
    list: { type: "boolean", description: "List attachments only", default: false },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("mail", args.id);

    // Determine Windows save path
    let savePath = "";
    if (!args.list) {
      const localDir = args["save-to"] || homedir();
      const proc = Bun.spawn(["wslpath", "-w", localDir], { stdout: "pipe", stderr: "pipe" });
      savePath = (await new Response(proc.stdout).text()).trim();
    }

    const executor = await createExecutor();
    const result = await executor.execute<AttachmentInfo | AttachmentInfo[]>(
      "mail",
      "download-attachment",
      {
        entryId,
        attachIndex: parseInt(args.index, 10),
        savePath,
        listOnly: args.list,
      }
    );

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
      return;
    }

    if (args.list) {
      const atts = Array.isArray(result.data)
        ? result.data
        : result.data
        ? [result.data]
        : [];
      if (atts.length === 0) {
        console.log("No attachments.");
      } else {
        for (const a of atts) {
          const kb = (a.Size / 1024).toFixed(1);
          console.log(`[${a.Index}] ${a.FileName} (${kb} KB)`);
        }
      }
    } else {
      const r = result.data as { saved: boolean; fileName: string; path: string; size: number };
      console.log(`Saved: ${r.fileName} (${(r.size / 1024).toFixed(1)} KB)`);
    }
  },
});

export default attachment;
