Of course. Based on the detailed documentation and presentation you provided, I have created a revised and much more comprehensive README file for your "AI Mirror" project. This version incorporates the project's formal objectives, experimental journey, and final architecture as described in your documents.

---

# AI Mirror: A Deeply Personalized AI Companion

AI Mirror is a graduation project from the Faculty of Computers & Artificial Intelligence at Helwan University. [cite_start]It is a novel, multi-modal system that creates an AI character designed to mirror a real user's persona, moving beyond simple role-playing to achieve a high-fidelity, personalized simulation. [cite: 15]

[cite_start]The project addresses the challenge of generic chatbots by creating digital companions that reflect a user's unique communication style, emotional tone, and personal history, enabling more natural and meaningful human-AI interaction. [cite: 13, 14, 22]

## 👥 Project Team

* Anas Saleh Mousa AlSadiq
* Yara Mohammed Attia
* Mennatullah Essam Abd ElAziz
* Mahmoud Nasr Abd ElAziz
* Mohamed Ashraf Abo El Maaty
* Mohamed Ihab Mohamed Farid

[cite_start]**Supervisor:** Dr. Salwa Osama [cite: 4]

## ✨ Features

* [cite_start]**Multi-Platform Persona Creation**: Ingests user data from **WhatsApp**, **Telegram**, or a **structured questionnaire** to build a personality profile. [cite: 55, 194]
* [cite_start]**Automated Profile Generation**: Uses a Large Language Model (LLM) to analyze conversations and automatically generate a narrative biography and a structured Q&A knowledge base for the persona. [cite: 56, 201]
* [cite_start]**Retrieval-Augmented Generation (RAG)**: Employs a dedicated FAISS vector store for each persona, allowing the AI to retrieve relevant memories and context to provide accurate and consistent responses. [cite: 58, 145]
* **Multi-Modal Interaction**:
    * [cite_start]**Text Chat**: Standard text-based conversation. [cite: 142]
    * [cite_start]**Voice Messaging**: Send and receive asynchronous voice notes with AI transcription. [cite: 143]
    * [cite_start]**Real-Time Voice Calls**: Engage in live voice-to-voice conversations with the AI persona. [cite: 144]
* **Advanced AI Stack**:
    * [cite_start]**Speech-to-Text**: High-accuracy transcription via OpenAI's **Whisper (Large-v3)**. [cite: 237, 251]
    * [cite_start]**Text-to-Speech**: High-quality, clonable voice generation using **Coqui AI's XTTS model**. [cite: 107, 252]
    * **Core LLM**: Powered by **`meta-llama/llama-4-scout-17b-16e-instruct`** via the high-speed Groq API for intelligent response generation.

## ⚔️ Competitive Landscape

[cite_start]AI Mirror differentiates itself from existing commercial platforms by focusing on mirroring the *user's own personality* rather than interacting with pre-defined or fictional characters. [cite: 126]

| Feature | AI Mirror | Replika | Character.AI | Anima AI |
| :--- | :--- | :--- | :--- | :--- |
| **Mimics User's Real Personality** | **Yes** (based on real user data) | No | Limited (scripted) | Partially |
| **Learns from Real Messages** | WhatsApp, Telegram, Questionnaire | Questionnaire only | No | No |
| **Matches User's Style & Emotions** | **Fully** (via data analysis) | Emotionally Reactive | Scripted Responses | Tries to Adapt |
| **Supports Voice Output** | **Yes (High-quality, clonable)** | Yes | No | Yes (Basic) |
| **Primary Goal** | **Personalized, self-mimicking AI** | Emotional companion AI| Role-play | Emotional chat companion |
[cite_start]*(Source: [cite: 125])*

## 🏗️ System Architecture

[cite_start]The project utilizes a distributed, three-part architecture for modularity and scalability: [cite: 153]

1.  **React Native Frontend**: The cross-platform mobile app for user interaction, built with Expo. [cite_start]It communicates with both backend services. [cite: 19]
2.  [cite_start]**Node.js WhatsApp Bridge**: A dedicated middleware server using `whatsapp-web.js` to securely connect to the WhatsApp Web API, fetch chat data, and forward it for processing. [cite: 246]
3.  **Python AI Backend**: The core of the system, built with FastAPI. [cite_start]It handles all AI logic, including data analysis, persona generation, the RAG pipeline with FAISS, and interaction with external services like Groq (for the LLM) and the Whisper model for speech recognition. [cite: 245]

[cite_start]For a detailed visual representation, please see the **System Architecture Diagram (Figure 3.1)** on page 23 of the project documentation. [cite: 31]

##  journey️ Our Experimental Journey

The final architecture was the result of five distinct experimental phases that systematically addressed the challenges of creating a high-fidelity persona.

1.  [cite_start]**Experiment 1: Fine-Tuning with LoRA**: Initial attempts to fine-tune a lightweight model (Microsoft Phi-3) proved that generic datasets produce generic results, and the process was computationally demanding. [cite: 260, 268, 270]
2.  [cite_start]**Experiment 2: The Pivot to Inference**: We explored acquiring real data from Twitter and Facebook but faced significant technical and privacy hurdles. [cite: 275, 282] [cite_start]A successful pivot to using high-quality transcribed voice data with a powerful inference model (Llama 3.3 70B) showed great promise but revealed the need for a persistent memory mechanism. [cite: 295, 298]
3.  [cite_start]**Experiment 3: RAG + Fine-Tuning Hybrid**: Combining RAG with fine-tuning on the Character100 dataset led to "persona confusion," where the model mixed details between characters, highlighting the need for isolated persona contexts. [cite: 305, 307]
4.  [cite_start]**Experiment 4: Evaluating BlenderBot 3**: Testing Meta's specialized conversational model showed excellent dialogue quality but was too resource-intensive for our deployment constraints. [cite: 310, 311]
5.  **Experiment 5: Final Architecture (RAG-per-Persona)**: The successful final approach uses a dedicated RAG pipeline and FAISS index *for each persona*. [cite_start]This isolates memory and uses a powerful LLM via inference, achieving a highly personalized, consistent, and efficient simulation. [cite: 315, 318]

## 🚀 Setup and Installation

This project requires setting up three separate components.

### Prerequisites

* Git, Node.js, Python 3.11+, and a local Google Chrome installation.
* An **Ngrok Authtoken** and a **Groq API Key**.
* **Telegram API Credentials** (`API_ID` and `API_HASH`).

---

### 1. Python Backend (AI Server)

**A. Install Dependencies:**

```bash
pip install numpy==1.26.4 sentence-transformers==2.2.2 transformers==4.40.1 huggingface_hub==0.22.2 TTS==0.22.0 faiss-cpu==1.7.4 "git+https://github.com/openai/whisper.git" fastapi==0.100.0 uvicorn==0.22.0 python-multipart telethon gTTS httpx
```

**B. Configure Secrets:**
Open `Last_one.ipynb` and replace the placeholder values.
> **⚠️ IMPORTANT:** Do not commit your secret keys to GitHub. Use environment variables for a secure setup.

```python
# In Last_one.ipynb
GROQ_API_KEY = "gsk_YOUR_GROQ_API_KEY"
!./ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
API_ID = YOUR_TELEGRAM_API_ID
API_HASH = 'YOUR_TELEGRAM_API_HASH'
```

**C. Run the Server:**
The notebook will start the FastAPI server and the `ngrok` tunnel. **Copy the public Ngrok URL** it provides (e.g., `https://xxxx-xxxx.ngrok-free.app`).

---

### 2. Node.js WhatsApp Bridge

**A. Setup:**
In the directory with `index.js`, run:
```bash
npm install express cors qrcode-terminal whatsapp-web.js
```

**B. Configure Chrome Path:**
Open `index.js` and edit the `executablePath` to point to **your local Google Chrome installation**.

```javascript
// In index.js
executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Example for Windows
```

**C. Run the Server:**
1.  Run `node index.js`.
2.  Scan the QR code that appears in the terminal with your WhatsApp mobile app.
3.  Note the server's local IP address (e.g., `192.168.1.10`).

---

### 3. React Native Frontend

**A. Configure API URLs:**
Update the API constants in the app's source files:
* In `CallScreen.js`, `ChatScreen.js`, `TelegramImportScreen.js`, etc., set `PYTHON_API_URL` to your **Ngrok URL**.
* In `WhatsappImportScreen.js`, set `WHATSAPP_API_BASE_URL` to the **local IP address** of your Node.js server.

**B. Install & Run:**
```bash
# Navigate to the frontend project directory
npm install
expo start
```
Scan the Expo QR code with your phone to launch the app.

## 🔮 Future Work

* [cite_start]**Dynamic Memory**: Implement a mechanism for the AI to learn from new conversations and update its FAISS memory in real-time. [cite: 418]
* [cite_start]**Expanded Data Sources**: Add support for more platforms like Facebook Messenger or iMessage. [cite: 419]
* [cite_start]**Realistic Avatar**: Fully implement lip-syncing for the animated avatar to enhance immersion. [cite: 420, 467]
* [cite_start]**On-Device Models**: Explore running smaller models on-device to improve privacy and reduce reliance on external APIs. [cite: 421]
* [cite_start]**Robotics Integration**: Explore integrating the digital persona with a physical robotic platform for real-world interaction. [cite: 468]
