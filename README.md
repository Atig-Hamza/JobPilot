<div align="center">

# 🚀 JobPilot
### *Navigate the chaotic job market with precision, intelligence, and speed.*
<br/>

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=for-the-badge)](https://github.com/yourusername/jobpilot)
[![License](https://img.shields.io/badge/License-MIT-blueviolet?style=for-the-badge)]()

[Features](#-features) • [Roadmap](#-roadmap-coming-soon) • [Tech Stack](#-tech-stack) • [Installation](#-getting-started) • [Screenshots](#-visual-tour)

</div>

---

## 🚀 About The Project

**JobPilot** is a next-generation career acceleration platform designed to bridge the gap between talented individuals and their dream roles. By leveraging cutting-edge Large Language Models (LLM) and specialized web crawling agents (**JOP-1**), JobPilot automates the most tedious parts of the job search process.

Whether you are optimizing your CV, hunting for hidden job listings, or preparing for high-stakes technical interviews, JobPilot serves as your 24/7 intelligent agent.

---

## ✨ Features (Live & In-Progress)

### 🤖 **AI Command Center**
*   **Intelligent Chat Interface**: A fluid, responsive chat experience powered by our custom LLM controller.
*   **JOP-1 Web Crawler**: A specialized agent capable of scraping job listings from global markets in real-time. Supports country-specific filtering (USA, UK, Canada, France, Morocco, and more).
*   **Context-Aware**: The agent remembers your conversation history within a session optimization loop.

### 🎨 **Modern User Experience**
*   **Unified Sidebar Architecture**: A responsive, collapsible navigation rail that adapts from desktop to mobile (iPhone 11 Pro compatible).
*   **Theme Engine**: Built-in Dark Mode & Light Mode with seamless transitions.
*   **Mobile-First Design**: Experience a native-app feel on mobile browsers with fixed inputs and touch-optimized navigation.

### 📊 **Dashboard & Analytics**
*   **Credit System**: Track your AI usage and token consumption.
*   **Activity Logging**: Keep a history of your job searches and AI interactions.

---

## 🔮 Roadmap: Coming Soon

We are actively building the future of career tech. Here is what is currently in the development pipeline:

### 📄 **CV Optimization Engine (`resume_opt`)**
> *Status: In Development 🚧*
*   Upload your existing PDF/DOCX resume.
*   AI analysis against specific job descriptions (ATS Compliance Check).
*   Automated rewriting of bullet points for maximum impact.

### 👨‍💻 **Tech Interview Lab**
> *Status: Prototype Phase 🧪*
*   **Live Coding Environment**: Integrated code editor to practice DSA (Data Structures & Algorithms).
*   **AI Pair Programmer**: Get real-time hints and complexity analysis ($O(n)$) from the AI.

### 👽 **Behavioral Simulation**
> *Status: Planned 📅*
*   Voice-enabled mock interviews.
*   "Describe a difficult situation" - practice your STAR method responses with instant feedback on tone and clarity.

### 📋 **Application Kanban**
> *Status: Design Phase 🎨*
*   Trello-style board to track applications (Applied -> Interviewing -> Offer -> Rejected).
*   Automated email drafting for follow-ups.

---

## 🛠 Tech Stack

### **Frontend**
*   **Framework**: React 18 (Vite)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM (v6)
*   **State**: Context API + Local Hooks

### **Backend**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **Security**: JWT Auth, BCrypt, Helmet
*   **AI Services**: Custom LLM Integration, Puppeteer (Scraping)

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas)
*   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jobpilot.git
    cd jobpilot
    ```

2.  **Install Dependencies (Backend)**
    ```bash
    cd Backend
    npm install
    ```

3.  **Install Dependencies (Frontend)**
    ```bash
    cd ../Frontend
    npm install
    ```

4.  **Environment Setup**
    Create a `.env` file in the `Backend` folder:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

5.  **Run the App**
    *   **Backend**: `npm run dev` (inside `Backend/`)
    *   **Frontend**: `npm run dev` (inside `Frontend/`)

---

## 📸 Visual Tour

| **Dashboard (Dark)** | **Mobile View** |
|:---:|:---:|
| *Space for Screenshot* | *Space for Screenshot* |
| Comprehensive analytics and AI chat. | Optimized layout for small devices. |

| **Sidebar Navigation** | **AI Agent** |
|:---:|:---:|
| *Space for Screenshot* | *Space for Screenshot* |
| Smooth collapsible animations. | Real-time job scraping results. |

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">

**Built with ❤️ for Job Seekers everywhere.**

&copy; 2026 JobPilot Team

</div>
