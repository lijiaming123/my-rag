import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { RAGService } from "./rag/RAGService.js";

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rag = new RAGService();

/**
 * 🔥 健康检查
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "RAG API",
  });
});

/**
 * 📥 初始化知识库（从文件）
 */
app.post("/ingest/file", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "docs/a.md");
    const doc = fs.readFileSync(filePath, "utf-8");

    await rag.ingest([doc]);

    res.json({
      success: true,
      message: "知识库初始化成功",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * 💬 提问接口
 */
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "question is required",
      });
    }

    const result = await rag.query(question);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * 🚀 启动服务
 */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 RAG API running at http://localhost:${PORT}`);
});