import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RAGService } from "./src/rag/RAGService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rag = new RAGService();

// 读取文档
const doc = fs.readFileSync(
  path.join(__dirname, "docs/a.md"),
  "utf-8"
);

// 1️⃣ 写入知识库
await rag.ingest([doc]);

// 2️⃣ 提问
const result = await rag.query("什么是RAG？");

console.log("🤖 答案：", result.answer);