# 🏆 CareerMitra - Hackathon Setup Guide

## 🔐 **IMPORTANT: Secure Configuration Setup**

**⚠️ Never commit API keys to GitHub! Follow this guide to set up your environment securely.**

## 📋 **Step 1: Clone and Install**

```bash
git clone <your-repo-url>
cd careermitra
npm install
```

## 🔑 **Step 2: Environment Variables Setup**

### **Create your local `.env` file:**

```bash
cp .env.example .env
```

### **Add your actual Firebase configuration:**

Replace the placeholder values in `.env` with your actual Firebase config:

```env
# Firebase Configuration - CareerMitra
VITE_FIREBASE_API_KEY=AIzaSyBilTyljDCVpcJ5i1sv6tuB7P8Q8QjVRFA
VITE_FIREBASE_AUTH_DOMAIN=careermitra-ef490.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=careermitra-ef490
VITE_FIREBASE_STORAGE_BUCKET=careermitra-ef490.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=506409003302
VITE_FIREBASE_APP_ID=1:506409003302:web:3b4aa01a9a422a360379e7
VITE_FIREBASE_MEASUREMENT_ID=G-0E4Q1HEDTV

# Azure OpenAI Configuration (Optional)
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
VITE_AZURE_OPENAI_KEY=your_azure_openai_api_key_here
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4.1
VITE_AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

## 🔥 **Step 3: Firebase Setup**

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Select your project: `careermitra-ef490`**
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable Email/Password
4. **Set up Firestore:**
   - Go to Firestore Database
   - Choose "Start in test mode"
   - Region: `asia-south1 (Mumbai)`

## 🚀 **Step 4: Run the Application**

```bash
npm run dev
```

Visit: `http://localhost:5173`

## 👤 **Step 5: Admin Access**

**Default Admin Login:**
- Email: `admin@careermitra.com`
- Password: `Admin@123`

## 🛡️ **Security Best Practices**

### **✅ DO:**
- Keep `.env` file local only
- Use environment variables for all secrets
- Add `.env` to `.gitignore` (already done)
- Use different credentials for production

### **❌ DON'T:**
- Commit API keys to GitHub
- Share credentials in chat/email
- Use production keys in development
- Hardcode secrets in source code

## 📁 **File Structure**

```
careermitra/
├── .env                 # Your local environment (NOT in git)
├── .env.example         # Template file (safe to commit)
├── .gitignore          # Excludes .env from git
├── src/
│   ├── lib/firebase.ts # Uses environment variables
│   └── ...
└── README.md
```

## 🔧 **Troubleshooting**

### **Firebase Connection Issues:**
1. Check if `.env` file exists
2. Verify Firebase config values
3. Ensure project is active in Firebase Console

### **Authentication Issues:**
1. Verify Email/Password is enabled in Firebase Auth
2. Check if admin user exists in Firestore
3. Clear browser cache and try again

### **Build Issues:**
1. Run `npm install` again
2. Delete `node_modules` and reinstall
3. Check for TypeScript errors

## 🎯 **Hackathon Demo Tips**

1. **Test admin login first**
2. **Create sample student accounts**
3. **Upload sample resumes**
4. **Show AI features (if Azure OpenAI is configured)**
5. **Demonstrate recruiter dashboard**

## 📞 **Support**

If you encounter issues:
1. Check this setup guide
2. Verify environment variables
3. Check Firebase console for errors
4. Review browser console for JavaScript errors

---

**🏆 Good luck with your hackathon! CareerMitra is ready to impress the judges!**