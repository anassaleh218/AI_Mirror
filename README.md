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

### 1️⃣ Backend Setup (Python / FastAPI)

```bash
# Clone the repository
git clone https://github.com/your-username/ai-mirror.git
cd ai-mirror/backend

# Install Python dependencies
pip install -r requirements.txt

# Create a .env file and add your API keys
# GROQ_API_KEY="YOUR_GROQ_KEY"
# OPENAI_API_KEY="YOUR_OPENAI_KEY"
# PLAYAI_API_KEY="YOUR_PLAYAI_KEY"

# Start the FastAPI server
uvicorn main:app --reload
```

```bash
# In a new terminal, expose your backend with Ngrok
ngrok http 8000
```

> 📌 **Note**: Save the Ngrok forwarding URL (e.g., `https://<hash>.ngrok-free.app`) for use in the frontend.

---

### 2️⃣ WhatsApp Middleware Setup (Node.js)

```bash
# Navigate to the middleware directory
cd ../middleware

# Install Node.js dependencies
npm install

# Start the middleware server
node index.js
```

> 📱 On first run, you may need to scan a WhatsApp QR code from the terminal with your mobile app to establish the session.

---

### 3️⃣ Frontend Setup (React Native)

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install
```

```js
// In your React Native config file or API client,
// set the API base URL to your Ngrok URL
const API_URL = "https://<your-ngrok>.ngrok-free.app";
```

```bash
# Start the application
npx expo start
```

> 📲 Scan the QR code from the terminal using the **Expo Go** app on your mobile device.

---

## ❯ Usage

1. **Launch the App**: Open the AI Mirror mobile app.
2. **Create a Persona**:
   - Fill in the questionnaire manually.
   - Upload your exported WhatsApp `.txt` file.
   - Log in securely to Telegram and select a chat.
3. **Start Chatting**:
   - Text, voice notes, or live voice calls — all personalized via your AI persona!

---

## ❯ Project Team & Acknowledgments

### 👨‍💻 Authors

- Anas Saleh Mousa AlSadiq  
- Yara Mohammed Attia  
- Mennatullah Essam Abd ElAziz  
- Mahmoud Nasr Abd ElAziz  
- Mohamed Ashraf Abo El Maaty  
- Mohamed Ihab Mohamed Farid  

### 🎓 Supervisor

**Dr. Salwa Osama**  
> We would like to express our deepest gratitude for her invaluable guidance, expertise, and mentorship throughout this project.

---

## 📄 License

This project is developed for academic and research purposes.  
For collaborations or inquiries, feel free to contact the authors directly.

---
