# 🏛️ TrustVote: Secure Blockchain-Based Online Voting System With Multi-Factor Authentication

An IEEE-standard compliant, production-grade **Online Voting System** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), **Biometric Face Landmark Recognition** (TensorFlow `face-api.js`), **Phone SMS OTP Passcode Verification**, **SHA-256 Proof-of-Work Blockchain Vote Ledger**, and **Socket.io Real-Time Streaming**.

---

## ✨ Key System Features

- **🔐 Multi-Factor Authentication (MFA)**: 4-stage sequential identity pipeline combining Voter ID + Password + 128-float Neural Face Scan Matching + Registered Phone SMS OTP.
- **⛏️ Cryptographic SHA-256 Blockchain Ledger**: Every vote is mined into an immutable block linked with the previous block's SHA-256 hash, preventing vote tampering.
- **📍 Location-Based Election System**: Enforces geographical boundaries (Gram Panchayat, Ward, Municipality, Taluk, District, City) so voters only see elections assigned to their jurisdiction.
- **🛡️ One-Person-One-Vote Token Engine**: Prevents double-voting using anonymous one-way cryptographic tokens (`SHA-256(voterId + electionId)`).
- **🔒 Private Sealed Voter Ballot**: Voters can inspect their private sealed choice receipt, while public live results ONLY expose aggregate candidate tallies.
- **📡 Real-Time WebSockets Results**: Instant candidate vote distribution updates powered by Socket.io.
- **🔍 Public Blockchain Explorer**: Automated SHA-256 hash recalculation tool for public chain auditing.
- **🎨 Glassmorphic Responsive UI/UX**: Built with React 18, Tailwind CSS v3, and Lucide React icons.

---

## 🏗️ System Architecture

```text
TrustVote/
├── client/                     # Frontend Application (React 18 + Tailwind CSS + Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, FaceScanner, OTPModal, BlockchainBadge
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Home, Register, Login, VoterDashboard, VotingPage, LiveResults, BlockchainExplorer, AdminDashboard
│   │   ├── services/           # Axios API Client
│   │   └── utils/              # faceApiLoader
│   └── vite.config.js
│
└── server/                     # Backend API & Blockchain Engine (Node.js + Express)
    ├── blockchain/             # Block.js & Blockchain.js SHA-256 Engine
    ├── config/                 # db.js & mailer.js
    ├── controllers/            # authController, electionController, candidateController, voteController, blockchainController
    ├── middleware/             # authMiddleware (JWT & Role Guards)
    ├── models/                 # User, Location, Election, Candidate, Vote, Block Schemas
    ├── routes/                 # Express API Endpoint Routes
    └── services/               # otpService & faceService (Euclidean Distance Matcher)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas Cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/trustvote-voting-system.git
cd trustvote-voting-system
```

### 2. Backend Setup
```bash
cd server
npm install
node utils/seedData.js   # Seed sample location, election, and demo voters
npm start
```

### 3. Frontend Setup (New Terminal Tab)
```bash
cd client
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**!

---

## 🔑 Demo Credentials

| Role | Voter ID | Password | Phone |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADMIN123` | `admin123` | `+919876543210` |
| **Voter** | `VOTER1001` | `voter123` | `+919123456789` |

---

## 📄 License
Distributed under the ISC License. Designed for Final Year Engineering Capstone Projects & Research Publications.
