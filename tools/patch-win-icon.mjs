import path from "node:path";
import { fileURLToPath } from "node:url";
import { rcedit } from "rcedit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const exePath = path.join(rootDir, "release", "win-unpacked", "Notative.exe");
const iconPath = path.join(rootDir, "assets", "notative.ico");

await rcedit(exePath, { icon: iconPath });
console.log("Patched executable icon:", exePath);
