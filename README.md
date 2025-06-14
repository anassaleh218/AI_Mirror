# AI Mirror - Your Personalized AI Companion

**AI Mirror** is a cutting-edge, multi-modal conversational AI system designed to create an AI companion that mirrors a user's unique personality, communication style, and knowledge base.  
Unlike generic chatbots, AI Mirror ingests your conversational data to build a high-fidelity digital "mirror," offering deeply personal and contextually-aware interactions.

> 🎓 This project was submitted as a graduation dissertation to the Faculty of Computers & Artificial Intelligence at Helwan University in June 2025.

![AI Mirror - Conceptual UI Preview](#) <!-- Replace with image URL -->

---

## ❯ Core Concept: RAG-per-Persona Architecture

Most chatbots are impersonal and rely on generic responses. AI Mirror introduces a novel architecture called **"RAG-per-Persona"**, which enables deeply personalized AI companions.

### 🔄 Workflow:

1. **Persona Creation (Data Ingestion):**  
   Users provide data via:
   - Structured questionnaire
   - WhatsApp chat history (.txt import)
   - Telegram chat history (secure login)

2. **Backend AI Processing:**  
   A powerful LLM (`llama-4-scout-17b-16e-instruct`) analyzes the data to generate:
   - A rich narrative biography
   - Structured Q&A personality format

3. **Vector Memory Creation:**  
   All textual data is embedded and stored in a private **FAISS index**, forming a searchable long-term memory.

4. **User Interaction:**  
   Through a **Retrieval-Augmented Generation (RAG)** pipeline, the system fetches relevant memory chunks and generates personalized responses in real time.

---

## ❯ Key Features

- **📥 Multi-Source Persona Creation:**
  - In-app Questionnaire
  - WhatsApp Chat Import (.txt)
  - Telegram Chat Import (secure login)

- **💬 Multi-Modal Interaction:**
  - Text Chat
  - Voice Messages (transcribed via OpenAI Whisper)
  - Voice Calls (AI replies using PlayAI Arabic TTS)

- **🧠 Persistent, Context-Aware Memory**
  - User-specific FAISS vector memory ensures deep personalization

- **📝 Automatic Profile Generation**
  - Bio and structured data extracted intelligently

- **🔊 Personalized Voice Output**
  - Natural-sounding Arabic responses using PlayAI TTS

- **📱 Cross-Platform Mobile App**
  - Built with **React Native** for both iOS and Android

---

## ❯ Tech Stack

| Component        | Technology                    | Purpose                                         |
|------------------|-------------------------------|-------------------------------------------------|
| **Frontend**     | React Native (Expo Go)        | Cross-platform mobile UI                        |
|                  | AsyncStorage                  | Local storage for profiles & chat history       |
| **Backend**      | Python 3, FastAPI             | Core AI logic, persona processing, and RAG      |
|                  | Ngrok                         | Exposes FastAPI server for development          |
| **Middleware**   | Node.js, Express              | WhatsApp Web session manager                    |
| **AI Models**    | `llama-4-scout-17b-16e-instruct` | Large Language Model for text generation    |
|                  | OpenAI Whisper (large-v3)     | Voice-to-text transcription                     |
|                  | PlayAI TTS (Arabic)           | Text-to-Speech voice output                     |
| **Embeddings**   | Sentence-Transformers         | Text vectorization for RAG                      |
| **Vector DB**    | FAISS                         | Long-term memory storage & retrieval            |

---

## ❯ Setup and Installation

### 🔧 Prerequisites

- Python 3.8+
- Node.js and npm
- Ngrok account
- API keys: Groq, OpenAI, PlayAI

---

### 1. Backend Setup (FastAPI)

```bash
# Clone the repo
git clone https://github.com/your-username/ai-mirror.git
cd ai-mirror/backend

# Install dependencies
pip install -r requirements.txt

# Create a .env file with your API keys
# GROQ_API_KEY="your_groq_key"
# OPENAI_API_KEY="your_openai_key"
# PLAYAI_API_KEY="your_playai_key"

# Start the FastAPI server
uvicorn main:app --reload

# Expose with Ngrok (in a new terminal)
ngrok http 8000
