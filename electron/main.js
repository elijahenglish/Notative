const path = require("path");
const dotenv = require("dotenv");
const { app, BrowserWindow, ipcMain } = require("electron");
const OpenAI = require("openai");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function scorePriority(text) {
  const t = text.toLowerCase();
  if (/\b(urgent|asap|immediately|today|deadline|overdue|critical)\b/.test(t)) {
    return "high";
  }
  if (/\b(this week|soon|important|follow up)\b/.test(t)) {
    return "medium";
  }
  return "low";
}

function normalizeTaskTitle(line) {
  return line
    .replace(/^[-*\d.)\s\[\]xX]+/, "")
    .replace(/^\s*(todo|task|action)\s*[:\-]?\s*/i, "")
    .trim();
}

function heuristicTaskExtraction(noteText) {
  const lines = noteText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const taskSignals = /\b(todo|need to|should|must|remember to|action item|follow up|email|call|review|schedule|finish|complete|fix|send|prepare|buy)\b/i;
  const tasks = [];
  const seen = new Set();

  for (const line of lines) {
    const isCheckbox = /^[-*\s]*\[(?:\s|x|X)\]/.test(line);
    if (!isCheckbox && !taskSignals.test(line)) {
      continue;
    }

    const title = normalizeTaskTitle(line);
    if (!title) {
      continue;
    }

    const key = title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    tasks.push({
      title: title.length > 90 ? `${title.slice(0, 87)}...` : title,
      description: line,
      priority: scorePriority(line),
      sourceSnippet: line
    });

    if (tasks.length >= 25) {
      break;
    }
  }

  return tasks;
}

async function extractTasksWithAI(noteText) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      source: "heuristic",
      tasks: heuristicTaskExtraction(noteText),
      warning: "OPENAI_API_KEY not set. Using local heuristic extraction."
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You extract concrete tasks from notes. Return only valid JSON with this exact shape: {\"tasks\":[{\"title\":string,\"description\":string,\"priority\":\"low\"|\"medium\"|\"high\",\"sourceSnippet\":string}]}. Do not include markdown. Keep tasks actionable and concise."
      },
      {
        role: "user",
        content: `Extract actionable tasks from these notes:\n\n${noteText}`
      }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

  return {
    source: "openai",
    tasks: tasks
      .filter((task) => task && typeof task.title === "string" && task.title.trim())
      .map((task) => ({
        title: String(task.title).trim().slice(0, 120),
        description: String(task.description || "").trim().slice(0, 300),
        priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "low",
        sourceSnippet: String(task.sourceSnippet || "").trim().slice(0, 300)
      }))
      .slice(0, 25)
  };
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1340,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    autoHideMenuBar: true,
    backgroundColor: "#f1e9de",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "..", "public", "index.html"));
}

ipcMain.handle("notative:extractTasks", async (_, inputText) => {
  const noteText = String(inputText || "").trim();
  if (!noteText) {
    return { error: "The request needs a non-empty text field." };
  }

  try {
    return await extractTasksWithAI(noteText);
  } catch (error) {
    console.error("Task extraction failed:", error);
    return {
      error: "Task extraction failed.",
      details: "Check your API key/model settings or try again."
    };
  }
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
