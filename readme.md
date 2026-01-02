<div align="center">

# 🧠 Hygenious - AI-Powered Hygiene Audit System

![Hygenious Logo](https://img.shields.io/badge/Hygenious-AI_Hygiene_Auditor-0D9488?style=for-the-badge)

**Turning any web browser into an instant, unbiased hygiene auditor**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-FF6F00?style=flat-square&logo=tensorflow)](https://www.tensorflow.org/js)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Team Sandbox** • HealthTech & Wellness Track  
**Hack Karnataka 2025** – GDG Hubli × KLE Technological University

[Demo](#-demo) • [Features](#-key-features) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 💡 About

**Hygenious** is a web-based AI hygiene audit system that analyzes cleanliness from images of kitchens, restrooms, dining areas, and storage rooms. Upload a photo and get an instant **Cleanliness Score (0–100)** with detailed issue detection and automatic **ranking** and **certification** for top-performing places.

### The Problem
- Manual hygiene inspections are slow and subjective  
- Paper checklists are unreliable  
- Businesses need real-time, scalable hygiene monitoring  
- Customers demand transparent verification of cleanliness  

### Our Solution
**Upload → AI Analyzes → Get Instant Score + Rank + Certificate**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧼 **AI Hygiene Scan** | Detects stains, spills, litter, clutter, and PPE violations |
| ⚡ **Cleanliness Score** | Instant 0–100 score with category breakdowns |
| 🧾 **Issue Logs** | Automatically lists detected problems with severity levels |
| 📊 **Dashboard** | Track scores, trends, and improvements over time |
| 🪪 **QR Code Display** | Share verified hygiene scores publicly |
| 🏆 **Ranking System** | Compares hygiene performance across all locations and displays leaderboard |
| 🎖️ **Certificate Generator** | Automatically awards digital hygiene certificates for high-performing places |
| 📈 **Analytics** | Visual insights with charts and reports |

---

### Screenshots

<table align="center">
  <tr>
    <th>Dashboard</th>
    <th>New Audit</th>
    <th>Results</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://i.ibb.co/dwP8jFHr/Screenshot-2025-11-09-at-1-11-10-AM.png" alt="Dashboard" width="260"/>
    </td>
    <td align="center">
      <img src="https://i.ibb.co/qLkdFTPc/Screenshot-2025-11-09-at-1-11-20-AM.png" alt="Audit" width="260"/>
    </td>
    <td align="center">
      <img src="https://i.ibb.co/Kj16rrtQ/Screenshot-2025-11-09-at-1-12-22-AM.png" alt="Results" width="260"/>
    </td>
  </tr>
</table>

🚀 **[Live Demo](https://hygenious.vercel.app)** (Coming Soon)

---

## 🧮 Scoring System
```
🟢 Excellent (85-100) → Clean, high hygiene standards
🟡 Good (60-84)       → Acceptable with minor issues
🔴 Poor (0-59)        → Requires immediate attention
```

**Formula:**
```
Final Score = 100 - (Critical Issues × 15) - (High Issues × 10) - (Medium Issues × 5) - (Low Issues × 2)
```

---

## 🤖 AI/ML Architecture

### Models Used

1. **COCO-SSD** (Object Detection)
   - Detects litter, food items, PPE equipment
   - Real-time browser inference with TensorFlow.js
   - Accuracy: 85-90%

2. **MobileNetV2/V3** (Image Classification)
   - Classifies: Clean / Medium / Dirty
   - Transfer learning from ImageNet
   - Accuracy: 83-89%

3. **Vision Transformer (ViT)** (Feature Extraction)
   - Fine-grained stain/spill detection
   - Trained on custom dataset (2000+ images)
   - Accuracy: 87%

4. **Image Processing** (Stain Detection)
   - OpenCV-based dark spot detection
   - Hybrid approach with CNN validation
   - Accuracy: 75%

### Training Pipeline
```python
# Example: MobileNet Training
base_model = MobileNetV3Large(weights='imagenet', include_top=False)
base_model.trainable = False

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(3, activation='softmax')  # Clean, Medium, Dirty
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

**Training Environment:** Google Colab (GPU: T4/V100)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ShadCN UI** - Beautiful component library
- **Recharts** - Data visualization

### Backend & Database
- **Node.js / Express.js** - API server
- **MongoDB Atlas** - Document database (audit logs)
- **Neon PostgreSQL** - Relational database (users)
- **Clerk** - Authentication

### AI/ML
- **TensorFlow.js** - Browser-based ML inference
- **Python (FastAPI)** - Model training & deployment
- **Google Cloud Vision API** - Enhanced detection
- **Hugging Face** - Model hosting

### Storage & Deployment
- **Cloudinary / AWS S3** - Image storage
- **Vercel** - Web hosting
- **GitHub Actions** - CI/CD

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+ (for ML training)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/hygenious.git
cd hygenious
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."
MONGODB_URI="mongodb+srv://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Image Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

---

## 📁 Project Structure
```
hygenious/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard pages
│   ├── api/                 # API routes
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # ShadCN components
│   ├── ScoreDisplay.tsx     # Score visualization
│   └── IssueCard.tsx        # Issue display
├── lib/                     # Utilities
│   ├── ai-service.ts        # AI inference logic
│   └── db.ts                # Database connections
├── models/                  # ML models
│   ├── mobilenet/          # Classification model
│   └── coco-ssd/           # Object detection
├── public/                  # Static assets
└── README.md
```

---

## 🧪 ML Model Training

### Training on Google Colab

1. **Open Colab Notebook**
```python
# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Install dependencies
!pip install tensorflow transformers
```

2. **Load Dataset**
```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    horizontal_flip=True
)

train_generator = train_datagen.flow_from_directory(
    'dataset/train',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)
```

3. **Train Model**
```python
model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator
)
```

4. **Convert to TensorFlow.js**
```bash
tensorflowjs_converter \
    --input_format=keras \
    model.h5 \
    tfjs_model/
```

5. **Deploy to Web**
```typescript
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/models/model.json');
const prediction = model.predict(imageTensor);
```

---

## 🎯 Usage

### 1. Create New Audit
1. Navigate to **Dashboard → New Audit**
2. Upload image (drag & drop or click)
3. Select location type (Kitchen, Restroom, etc.)
4. Click **"Analyze Image"**
5. View results in ~10 seconds

### 2. View Dashboard
- See total audits, average score, critical issues
- Track score trends over time
- Compare location performance

### 3. Generate QR Code
1. Go to **Locations**
2. Click **"Add Location"**
3. Enable **"Generate QR Code"**
4. Download and display at location

### 4. Public Verification
- Customers scan QR code
- View verified hygiene score
- See recent audit history

---

## 📊 Performance Metrics

| Model | Accuracy | Inference Time | Model Size |
|-------|----------|----------------|------------|
| COCO-SSD | 85-90% | <100ms | 27MB |
| MobileNetV3 | 83-89% | ~200ms | 16MB |
| Vision Transformer | 87% | ~500ms | 350MB |
| Stain Detection | 75% | ~150ms | N/A |

**Overall System:**
- Average Analysis Time: **8-12 seconds**
- End-to-End Accuracy: **80-85%**

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Use conventional commits

---

## 🐛 Issues & Support

Found a bug? Have questions?

- 🐛 [Report Bug](https://github.com/yourusername/hygenious/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/yourusername/hygenious/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/yourusername/hygenious/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team Sandbox

## 👥 Team Sandbox — Hygenious

| Name | Role | GitHub | Email |
|------|------|--------|--------|
| **Yash Krishna Divate** | Team Leader & Full Stack Developer | [@yashsejuro](https://github.com/yashsejuro) | yashsejuro.ys@gmail.com |
| **Kundan Sahu** | Lead ML & Backend Engineer | [@Kundan730](https://github.com/Kundan730) | espkundan@gmail.com |
| **Harsha Krishna Divate** | Frontend & ML Engineer | [@HarshaDivate](https://github.com/HarshaDivate) | harshdivate.hd@gmail.com |
| **Harish Chabbi** | Dataset & Research | [@harishchabbi](https://github.com/harishchabbi) | chabbiharish83@gmail.com |


---

## 🙏 Acknowledgments

- **Hack Karnataka 2025** - GDG Hubli × KLE Technological University
- **TensorFlow.js** - For browser-based ML
- **Hugging Face** - For model hosting
- **Google Colab** - For free GPU training

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**Built with ❤️ by Team Sandbox**

**Hack Karnataka 2025 • HealthTech & Wellness Track**

</div>