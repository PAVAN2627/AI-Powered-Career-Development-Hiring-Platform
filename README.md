# CareerMitra - AI-Powered Career Development Platform

A comprehensive platform that bridges the gap between students/graduates and recruiters through AI-powered career guidance, resume optimization, and interview preparation.

## 🚀 Features

### Student Module
- **Enhanced ATS Resume Analyzer** - AI-powered resume optimization with comprehensive skill extraction
- **Smart Learning Path Generation** - Personalized career roadmaps with curated courses and certifications
- **Real-time Career Dashboard** - Live progress tracking with Firebase integration
- **Voice-Based Mock Interviews** - AI interviewer with speech-to-text evaluation
- **Mobile-Responsive Design** - Bottom navigation for mobile devices
- **Skill Gap Analysis** - Detailed analysis with learning recommendations

### Recruiter Module
- **Verified Recruiter System** - Admin-approved company accounts
- **Advanced Candidate Search** - Filter by skills, ATS scores, and availability
- **Real-time Messaging** - Direct communication with candidates
- **Smart Matching Algorithm** - AI-powered candidate-job fit scoring

### Admin Module
- **User Management** - Oversee students and recruiters
- **Recruiter Verification** - Approve company registrations
- **Platform Analytics** - Comprehensive insights and reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Mobile-responsive design** with bottom navigation

### Backend & Services
- **Firebase Authentication** - User management
- **Firestore Database** - Real-time data storage
- **Azure OpenAI GPT-4** - AI-powered analysis and generation
- **Enhanced ATS Service** - Comprehensive skill extraction and role matching

### Key Improvements
- **Enhanced Keyword Extraction** - 100+ technical skills, tools, and frameworks
- **Better Role Matching** - Improved scoring algorithm with fuzzy matching
- **Comprehensive Learning Paths** - 500+ courses from multiple platforms
- **Real-time Data Integration** - Firebase listeners for live updates
- **Mobile-First Design** - Responsive navigation and UI

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Azure account (for OpenAI services)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/careermitra.git
cd careermitra
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Add your Firebase and Azure OpenAI credentials to `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_AZURE_OPENAI_KEY=your_azure_openai_key
VITE_AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Copy configuration to your `.env` file

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📱 Mobile Experience

The platform now features a mobile-responsive design with:
- **Bottom Navigation Bar** - Easy access to main features on mobile
- **Responsive Sidebar** - Hidden on mobile, visible on desktop
- **Touch-Friendly Interface** - Optimized for mobile interactions
- **Progressive Web App** - Can be installed on mobile devices

## 🎯 ATS Analyzer Improvements

### Enhanced Skill Extraction
- **100+ Technical Skills** - JavaScript, React, Python, AWS, Docker, etc.
- **Soft Skills Detection** - Leadership, communication, problem-solving
- **Tools & Platforms** - JIRA, Figma, VS Code, Postman, etc.
- **Certifications** - AWS, Google Cloud, Microsoft, etc.

### Better Role Matching
- **Fuzzy Matching Algorithm** - Handles skill variations and synonyms
- **Weighted Scoring** - 70% required skills, 20% preferred, 10% experience
- **Experience Analysis** - Years of experience and role relevance
- **Bonus Points** - For relevant experience and skill diversity

### Comprehensive Learning Paths
- **500+ Courses** - From Udemy, Coursera, YouTube, freeCodeCamp
- **Multiple Difficulty Levels** - Beginner to advanced
- **Free & Paid Options** - Mix of free and premium resources
- **Priority-Based Learning** - Critical, high, medium priority skills

## 📊 Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── MobileBottomNav.tsx  # Mobile navigation
│   │   └── DashboardSidebar.tsx # Desktop sidebar
│   ├── ui/                # Reusable UI components
│   └── landing/           # Landing page components
├── pages/
│   ├── Dashboard.tsx      # Real-time student dashboard
│   ├── ATSAnalyzer.tsx    # Enhanced ATS analyzer
│   ├── CareerRoadmap.tsx  # Learning path tracker
│   └── Profile.tsx        # User profile management
├── lib/
│   ├── enhancedATSService.ts    # Improved ATS analysis
│   ├── learningPathService.ts   # Learning recommendations
│   ├── realtimeDataService.ts   # Firebase real-time data
│   └── firebase.ts              # Firebase configuration
└── hooks/                 # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔐 Security

- All API keys stored in environment variables
- Firebase Security Rules implemented
- Authentication required for protected routes
- Input validation and sanitization

## 📈 Performance

- **Vite** for fast development and building
- **Code splitting** for optimized loading
- **Lazy loading** for components
- **Firebase caching** for real-time data
- **Mobile optimization** for better performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ for empowering careers through AI technology**
