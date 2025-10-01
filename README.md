
# DeepAgent: AI Governance Verification System

A comprehensive system for verifying AI governance research insights through a 3-phase adversarial protocol.

## 🚀 Project Structure

```
deepagent/
├── backend/           # Python MVP System
│   ├── src/          # Core verification logic
│   ├── prompts/      # LLM prompt templates
│   ├── schemas/      # JSON schemas
│   ├── tests/        # Test suite
│   └── docs/         # Documentation
│
├── app/              # Next.js Web Application
│   ├── app/          # Routes and pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and database
│   └── prisma/       # Database schema
│
├── Reports/          # Consultation reports
├── Uploads/          # Context packets and uploads
└── README.md         # This file
```

## 🎯 Features

### Backend (Python MVP)
- **3-Phase Verification Protocol**
  - Phase 1: Academic Discovery & Source Validation
  - Phase 2: Technical Feasibility Assessment
  - Phase 3: Contradiction Analysis
- Adversarial validation framework
- JSON-based input/output schemas
- Comprehensive test suite

### Frontend (Next.js Web App)
- Modern, responsive UI with Tailwind CSS
- Secure authentication (NextAuth.js)
- Real-time verification workflow
- PostgreSQL database integration
- Professional dashboard interface

## 🛠️ Tech Stack

**Backend:**
- Python 3.x
- LLM Integration
- JSON Schema validation

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Prisma ORM
- PostgreSQL

## 📦 Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd app
yarn install
```

## 🚀 Running the Application

### Backend
```bash
cd backend
python src/verifier.py --input sample_insight.json
```

### Frontend Development Server
```bash
cd app
yarn dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- [Backend Documentation](./backend/docs/)
- [API Integration Guide](./backend/integration/)
- [Deployment Summary](./backend/DEPLOYMENT_SUMMARY.md)
- [Consultation Report](./deepagent_protocol_consultation_report.md)

## 🔒 Security

- Secure authentication with bcrypt password hashing
- JWT-based session management
- Environment variable protection
- Database credential encryption

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd app
yarn test
```

## 📄 License

Proprietary - All Rights Reserved

## 👥 Authors

DeepAgent Verification System - AI Governance Research Project

## 🙏 Acknowledgments

Built with Next.js, React, TypeScript, Python, and modern web technologies.

---

**Version:** 1.0.0  
**Last Updated:** October 2025
