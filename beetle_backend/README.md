# Beetle Backend

Backend API for Beetle - Git-based collaboration platform with AI-powered processing.

## AI Architecture
The AI pipeline consists of seven specialized agents that work together to provide intelligent document processing, search, and conversational AI capabilities:

1. **Ingestion Agents** - Fetch raw content from various sources
2. **Format Agent** - Normalize and clean documents
3. **Embedding Agent** - Compute vector embeddings and store in Qdrant
4. **Retrieval Agent** - Search for relevant documents using hybrid search
5. **Prompt Rewriter** - Restructure prompts with context for chat models
6. **Answering Agent** - Generate responses using Google Gemini API