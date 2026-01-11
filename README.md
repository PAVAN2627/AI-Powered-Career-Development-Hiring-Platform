# AI-Powered Career Development & Hiring Platform

A comprehensive platform that bridges the gap between students/graduates and recruiters through AI-powered career guidance, resume optimization, and interview preparation.

## 🚀 Features

### Student Module
- **Authentication & Profile Management** - Firebase-based user registration and login
- **ATS Resume Builder & Analyzer** - AI-powered resume optimization with ATS scoring
- **Smart Skill Profiling** - Automatic skill extraction and gap analysis
- **Personalized Learning Roadmaps** - AI-generated career paths with curated resources
- **Voice-Based Mock Interviews** - AI interviewer with speech-to-text evaluation
- **Career Progress Tracking** - Comprehensive dashboard with analytics

### Recruiter Module
- **Verified Recruiter System** - Admin-approved company accounts
- **Advanced Candidate Search** - Filter by skills, ATS scores, and availability
- **Smart Matching Algorithm** - AI-powered candidate-job fit scoring
- **Interview Management** - Schedule and track candidate interactions

### Admin Module
- **User Management** - Oversee students and recruiters
- **Recruiter Verification** - Approve company registrations with document validation
- **Platform Analytics** - Comprehensive insights and reporting
- **Content Moderation** - Monitor and manage platform activity

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Query** for state management

### Backend & Services
- **Firebase Authentication** - User management
- **Firestore Database** - Real-time data storage
- **Firebase Storage** - File uploads (resumes, documents)
- **Azure OpenAI** - AI-powered analysis and generation
- **Murf AI** - Voice synthesis for AI interviewer
- **Deepgram** - Speech-to-text for interview analysis

### Deployment
- **Vercel** - Frontend hosting (free tier)
- **Firebase** - Backend services
- **Azure** - AI services

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Azure account (for OpenAI services)
- Murf AI account
- Deepgram account

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd careermitra
npm install
```

### 2. Environment Setup (IMPORTANT!)

**⚠️ NEVER commit API keys to GitHub!**

Copy the environment template:
```bash
cp .env.example .env
```

**Replace placeholder values in `.env` with your actual credentials:**
```env
# Add your actual Firebase config here
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain
# ... etc
```

**📋 See `HACKATHON_SETUP.md` for complete setup instructions with actual values.**

### 3. Firebase Setup (Required)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Copy configuration to your `.env` file

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. **Create Firestore Database**
   - Go to Firestore Database
   - **Choose "Start in test mode"** (Perfect for hackathon!)
   - **Region:** `asia-south1 (Mumbai)`
   - **No billing required!**

4. **Skip Firebase Storage**
   - Storage requires billing setup
   - Our platform uses Firestore for file storage instead
   - Files stored as Base64 strings (perfect for hackathon demo)

### 4. Firebase Security Rules

**Firestore Rules (Test Mode for Hackathon):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 3, 15);
    }
  }
}
```

**Note:** Firebase Storage is NOT required for this hackathon project. Files are stored as Base64 in Firestore to avoid billing requirements.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### 6. Default Admin Access

The platform includes a default admin account:
- **Email:** `admin@careermitra.com`
- **Password:** `Admin@123`

⚠️ **Important:** Change these credentials in production!

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/           # Landing page components
│   └── ui/               # Reusable UI components
├── pages/
│   ├── Dashboard.tsx     # Student dashboard
│   ├── Login.tsx         # Authentication
│   ├── Register.tsx      # User registration
│   ├── ResumeBuilder.tsx # Resume builder & analyzer
│   ├── InterviewPractice.tsx # Mock interview system
│   ├── RecruiterDashboard.tsx # Recruiter interface
│   └── AdminDashboard.tsx # Admin panel
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts         # Utility functions
└── hooks/               # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔐 Security & API Keys

- Store all API keys in environment variables
- Never commit `.env` files to version control
- Use Firebase Security Rules for database access
- Implement proper authentication checks

## 📊 Current Implementation Status

### ✅ Completed
- Landing page with hero, features, and testimonials
- Student dashboard with comprehensive UI
- Resume builder and ATS analyzer interface
- Mock interview practice system
- Recruiter dashboard with candidate search
- Admin dashboard with approval system
- Authentication pages (login/register)
- Responsive design and navigation
- Complete UI component library

### 🚧 In Progress / TODO
- Firebase authentication integration
- Azure OpenAI API integration
- Murf AI voice synthesis
- Deepgram speech-to-text
- File upload functionality
- Real-time data synchronization
- Email notifications
- Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

---

**Note**: This is a comprehensive career development platform. The current implementation provides a solid foundation with all major UI components and page structures. Backend integration with Firebase and AI services needs to be completed for full functionality.
