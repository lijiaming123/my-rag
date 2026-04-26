import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

export class RAGService {
  constructor() {
    // embedding 模型（本地）
    this.embeddings = new OllamaEmbeddings({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text",
    });

    // 向量库（内存版，后面可升级 Milvus）
    this.vectorStore = null;

    // LLM
    this.llm = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "qwen2",
    });
  }

  /**
   * 写入知识库
   */
  async ingest(docs) {
    this.vectorStore = await MemoryVectorStore.fromTexts(
      docs,
      docs.map(() => ({})),
      this.embeddings
    );
  }

  /**
   * 查询 + 生成答案
   */
  async query(question) {
    if (!this.vectorStore) {
      throw new Error("知识库未初始化，请先 ingest()");
    }

    // 1. 检索
    const results = await this.vectorStore.similaritySearch(question, 3);

    const context = results.map(r => r.pageContent).join("\n");

    // 2. 生成
    const response = await this.llm.invoke(`
你是一个严谨的AI助手，只能基于以下内容回答问题：

${context}

问题：${question}

如果内容没有提到，请回答“未找到相关信息”。
    `);

    return {
      answer: response.content,
      sources: results,
    };
  }

  /**
   * 清空知识库
   */
  reset() {
    this.vectorStore = null;
  }
}