# 🧼 Hygenious
**AI-powered hygiene audit platform built for trust, accuracy, and real-world business use.**

<p align="center">
  <i>Turning any smartphone into a reliable, AI-driven hygiene auditor.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-brightgreen" alt="Status"/>
  <img src="https://img.shields.io/badge/Node.js-18+-success" alt="Node.js"/>
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License"/>
</p>

---

## 🚀 About

**Hygenious** is an AI-driven hygiene intelligence platform that analyzes real-world images of spaces such as kitchens, restrooms, and dining areas to generate objective cleanliness scores and actionable insights.

Originally developed during **Hack Karnataka 2025** with Team Sandbox, I'm now rebuilding this project from the ground up with full ownership of the backend, APIs, and infrastructure—designed for real business deployment.

The system focuses on **consistency, explainability, and accuracy**, making it suitable for restaurants, hostels, clinics, and shared spaces—not just demos or hackathons.

---

## 💡 The Problem

❌ Manual hygiene audits are slow, subjective, and inconsistent  
❌ Customer reviews are unreliable and biased  
❌ Businesses lack visual proof and audit history  
❌ Traditional inspections are expensive and infrequent  

## ✅ The Solution

**Hygenious provides:**
- Instant, data-driven hygiene audits
- Transparent, rule-based scoring logic
- Visual proof with detected issue markers
- Audit history and compliance logs
- Human-in-the-loop feedback for continuous improvement

---

## ✨ Core Features (MVP)

| Feature | Description |
|---------|-------------|
| 📸 **Image-based Scanning** | Upload images for instant hygiene analysis |
| 📊 **Cleanliness Score (0-100)** | Objective scoring based on detected issues |
| 🧾 **Issue Breakdown** | Detailed list of problems with severity levels |
| 🗂️ **Audit History** | Track scans, trends, and improvements over time |
| 🔁 **Feedback Loop** | Human corrections improve AI accuracy |
| 🏆 **Ranking System** | Compare hygiene performance across locations |
| 🎖️ **Certification** | Digital hygiene certificates for high performers |

---

## 🎯 How It Works

```text
1. Capture an image of the space
2. AI detection pipeline identifies hygiene issues
3. Rule-based scoring engine calculates cleanliness score
4. Results logged with visual explanations
5. Manager can confirm/correct AI detections
6. Corrections improve model accuracy over time
```

---

## 🧠 System Design Philosophy

**AI detects facts. Logic decides impact. Humans validate results. Data improves accuracy.**

This separation ensures the system remains:
- ✅ **Defensible** - Scoring logic is transparent and adjustable
- ✅ **Explainable** - Every score can be justified
- ✅ **Scalable** - Modular architecture supports growth
- ✅ **Trustworthy** - Human oversight prevents AI errors

---

## 🧮 Scoring System

```
🟢 Excellent (85-100) → Clean, high hygiene standards
🟡 Good (60-84)       → Acceptable with minor issues  
🔴 Poor (0-59)        → Requires immediate attention
```

**Formula:**
```
Base Score = 100
- Trash detected        → -20 points
- Liquid spill detected → -25 points
- Uncovered food        → -15 points
- Dirty surface         → -10 points
- Clutter              → -5 points

Final Score = clamp(Base Score - Penalties, 0, 100)
```

This rule-based approach ensures:
- Scores are **repeatable** and **consistent**
- Business owners can understand **why** a score was given
- Adjustments can be made per business type

---

## 🤖 AI/ML Architecture

### Current Approach (MVP)
- **Object Detection:** YOLOv8-based detection for trash, spills, clutter
- **Confidence Filtering:** Only accepts detections above 0.6 confidence
- **Rule-Based Scoring:** Transparent penalty system
- **Human-in-the-Loop:** Manager corrections become training data

### Models Being Evaluated
| Model | Purpose | Accuracy Target |
|-------|---------|----------------|
| **YOLOv8** | Object detection (trash, spills, clutter) | 85%+ |
| **MobileNetV3** | Image classification (clean/medium/dirty) | 80%+ |
| **Custom CNN** | Stain/spill detection | 75%+ |

### Training Strategy
- Start with **pretrained models** (YOLO, MobileNet)
- Fine-tune on **real customer data** (India-specific environments)
- Collect corrections via **feedback loop**
- Retrain monthly with **validated labels**

---

## 🛠️ Tech Stack

### Backend (Current Focus)
- **Node.js + Express** - RESTful API server
- **MongoDB Atlas** - Scan logs and audit history
- **Cloudinary** - Image storage and delivery
- **JWT** - Authentication (planned)

### Frontend (Next Phase)
- **React / Next.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Component library

### AI/ML Pipeline
- **Python + FastAPI** - Model serving
- **TensorFlow / PyTorch** - Model training
- **OpenCV** - Image preprocessing
- **YOLOv8** - Object detection

### Deployment
- **Render / Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **GitHub Actions** - CI/CD

---

## 📁 Project Structure

```
hygenious/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── scan.js          # Scan endpoints
│   │   ├── controllers/
│   │   │   └── scanController.js # Business logic
│   │   ├── models/
│   │   │   └── Scan.js          # MongoDB schema
│   │   └── index.js             # Server entry point
│   ├── .env
│   ├── package.json
│   └── README.md
├── frontend/                    # (Coming soon)
├── ml-pipeline/                 # (Coming soon)
└── README.md                    # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yashsejuro/hygenious.git
cd hygenious/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-secret-key
```

4. **Run development server**
```bash
npm run dev
```

5. **Test the API**
```bash
# Health check
curl http://localhost:3000

# Test scan endpoint
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📊 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
```http
GET /
```
**Response:**
```json
{
  "message": "🧼 Hygenious API is running",
  "status": "healthy",
  "version": "1.0.0"
}
```

#### 2. Create Scan
```http
POST /api/scan
```
**Response:**
```json
{
  "success": true,
  "score": 78,
  "grade": "C",
  "issues": [
    {
      "type": "trash",
      "severity": "medium",
      "description": "Possible litter detected",
      "confidence": 0.82
    }
  ],
  "scanId": "scan_1704369600000",
  "timestamp": "2026-01-02T10:00:00.000Z"
}
```

#### 3. Get Scan History
```http
GET /api/scans
```

---

## 📈 Project Status

### ✅ Completed
- [x] Backend API structure
- [x] Mock hygiene scoring
- [x] Error handling
- [x] CORS configuration
- [x] Health check endpoint

### 🚧 In Progress
- [ ] Image upload (Cloudinary integration)
- [ ] MongoDB connection
- [ ] Real AI detection pipeline

### 📋 Planned
- [ ] Frontend UI
- [ ] User authentication
- [ ] Real-time dashboard
- [ ] QR code generation
- [ ] Certificate system
- [ ] Deployment (Render/Vercel)

---

## 🎯 Business Vision

Hygenious aims to become a **trusted hygiene intelligence layer** for:
- 🍽️ **Restaurants & Cafés** - Maintain standards, build customer trust
- 🏠 **Hostels & PGs** - Transparent cleanliness verification
- 🏥 **Clinics & Care Facilities** - Compliance documentation
- 🏢 **Shared Workspaces** - Regular hygiene monitoring

### Monetization Strategy
- **Freemium Model:** 10 free scans/month
- **Starter Plan:** ₹499/month (50 scans)
- **Pro Plan:** ₹2,999/month (Unlimited scans + analytics)
- **Enterprise:** Custom pricing for chains

---

## 🤝 Contributing

This is currently a **personal project**, but contributions are welcome!

If you'd like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Yash Krishna Divate**  
Full Stack Developer & Founder

- GitHub: [@yashsejuro](https://github.com/yashsejuro)
- Email: yashsejuro.ys@gmail.com
- LinkedIn: https://linkedin.com/in/yash-divate

---

## 🙏 Acknowledgments

- **Hack Karnataka 2025** - For the initial inspiration and hackathon experience
- **Team Sandbox** - Original hackathon team members
- **TensorFlow.js** - Browser-based ML inference
- **YOLOv8** - Object detection framework
- **OpenCV** - Image processing tools

---

## 🌟 Project Journey

This project started as a **hackathon idea** but is being rebuilt into a **real business product**:

✅ **Phase 1 (Hackathon):** Proof of concept with team  
✅ **Phase 2 (Current):** Solo rebuild with full ownership  
🚧 **Phase 3 (Next):** MVP with real AI + paying customers  
📋 **Phase 4 (Goal):** Scalable SaaS platform  

---

## 📞 Support

If you find this project interesting:
- ⭐ **Star this repo**
- 🐛 **Report bugs** via Issues
- 💡 **Suggest features** via Discussions
- 📧 **Reach out** for collaboration

---

<p align="center">
  Built with ❤️ by Yash Krishna Divate
</p>

<p align="center">
  <i>Rebuilding a hackathon idea into a real business | Jan 2026</i>
  

<p align="center">
⚠️ Status: MVP / Experimental
This project is under active development.
AI-based hygiene analysis is experimental and does not replace
professional health inspections.
</p>
