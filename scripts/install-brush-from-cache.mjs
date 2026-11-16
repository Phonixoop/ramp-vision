import fs from "node:fs";
import path from "node:path";

const registryPath = path.resolve("scripts/cache/brush.registry.json");
const outRoot = path.resolve("src/components/charts");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

for (const file of registry.files) {
  const content = file.content.replaceAll(
    'from "@/lib/utils"',
    'from "~/lib/utils"',
  );
  const target = path.join(outRoot, path.basename(file.target || file.path));
  fs.writeFileSync(target, content);
  console.log(
    "wrote",
    path.relative(process.cwd(), target),
    content.length,
    "hasRect",
    content.includes("<rect"),
  );
}
