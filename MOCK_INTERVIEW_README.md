# 🎯 Advanced AI Mock Interview System

A comprehensive mock interview platform with AI-powered video analysis, real-time body language tracking, and live AI interviewer calls using MediaPipe, OpenCV, and LiveKit.

## 🚀 Features

### 🎥 Three Interview Modes

1. **Practice Mode** - Text-based interviews with timer
2. **Live Video Mode** - Video analysis with body language tracking
3. **AI Call Mode** - Full AI interviewer with voice interaction

### 🧠 AI-Powered Analysis

- **Answer Quality Scoring** - Keyword matching, depth analysis, technical accuracy
- **Body Language Analysis** - Eye contact, posture, facial expressions, hand gestures
- **Real-time Feedback** - Instant scoring and improvement suggestions
- **Personalized Recommendations** - Tailored advice based on performance

### 📹 Video Analysis Features

- **Eye Contact Tracking** - Measures camera engagement percentage
- **Facial Expression Analysis** - Detects positive, neutral, negative, confused states
- **Posture Detection** - Monitors sitting position and body alignment
- **Hand Gesture Recognition** - Counts and analyzes hand movements
- **Confidence Scoring** - Combines multiple metrics for overall confidence level
- **Nervousness Detection** - Identifies stress indicators

### 🎤 Live AI Interviewer

- **Voice Interaction** - Natural conversation with AI interviewer
- **Role-based Personalities** - Different AI personas for different roles
- **Adaptive Questioning** - Questions adjust based on responses
- **Real-time Audio Processing** - Speech-to-text and text-to-speech
- **LiveKit Integration** - Professional video calling infrastructure

## 🛠 Technical Architecture

### Frontend Components

```
src/
├── pages/
│   ├── MockInterview.tsx          # Main interview interface
│   └── InterviewPractice.tsx      # Original practice mode
├── components/
│   └── interview/
│       ├── VideoInterviewAnalyzer.tsx  # MediaPipe video analysis
│       └── LiveKitInterviewRoom.tsx    # LiveKit integration
└── lib/
    └── interviewService.ts        # AI analysis service
```

### Key Technologies

- **MediaPipe** - Face mesh, hand tracking, pose estimation
- **OpenCV** - Computer vision processing
- **LiveKit** - Real-time video/audio communication
- **OpenAI GPT-4** - Answer analysis and AI interviewer
- **Whisper** - Speech-to-text transcription
- **TTS** - Text-to-speech synthesis

## 📊 Body Language Metrics

### Real-time Tracking

```typescript
interface BodyLanguageMetrics {
  eyeContact: number;        // 0-100% camera engagement
  facialExpression: string;  // 'positive' | 'neutral' | 'negative' | 'confused'
  handGestures: number;      // Gesture count per minute
  posture: string;          // 'good' | 'slouching' | 'leaning'
  confidence: number;       // 0-100% overall confidence
  engagement: number;       // 0-100% engagement level
  nervousness: number;      // 0-100% stress indicators
}
```

### Analysis Algorithms

1. **Eye Contact Detection**
   - Face landmark analysis
   - Eye-nose alignment calculation
   - Camera direction estimation

2. **Facial Expression Recognition**
   - Mouth corner position analysis
   - Eye state detection
   - Emotion classification

3. **Posture Analysis**
   - Shoulder alignment measurement
   - Head position relative to body
   - Sitting position assessment

4. **Hand Gesture Tracking**
   - Hand landmark detection
   - Movement velocity calculation
   - Gesture frequency analysis

## 🎯 Interview Question System

### Role-based Questions

```typescript
const interviewQuestions = {
  "frontend": {
    "easy": [
      {
        question: "Tell me about your frontend development experience",
        type: "behavioral",
        keywords: ["HTML", "CSS", "JavaScript", "React"],
        timeLimit: 180
      }
    ],
    "medium": [...],
    "hard": [...]
  },
  "backend": {...},
  "fullstack": {...}
}
```

### Question Types

- **Behavioral** - Experience and soft skills
- **Technical** - Knowledge and problem-solving
- **Situational** - Scenario-based challenges
- **Coding** - Live coding exercises

### Difficulty Levels

- **Easy** - Entry level (0-2 years)
- **Medium** - Mid level (2-5 years)
- **Hard** - Senior level (5+ years)

## 🔧 Setup Instructions

### Prerequisites

```bash
# Install dependencies
npm install

# Required packages (already in package.json)
@mediapipe/face_mesh
@mediapipe/hands
@mediapipe/pose
opencv-ts
```

### Environment Variables

```bash
# .env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_LIVEKIT_URL=your_livekit_url
VITE_LIVEKIT_API_KEY=your_livekit_api_key
VITE_LIVEKIT_API_SECRET=your_livekit_secret
```

### MediaPipe Setup

MediaPipe models are loaded from CDN automatically:
- Face Mesh: Face landmark detection
- Hands: Hand tracking and gesture recognition
- Pose: Body posture analysis

### LiveKit Configuration

For AI Call mode, you need:
1. LiveKit server instance
2. Token generation endpoint
3. Audio/video permissions

## 🎮 Usage Guide

### Starting an Interview

1. **Select Role** - Choose target position
2. **Set Difficulty** - Pick experience level
3. **Choose Mode** - Practice, Live Video, or AI Call
4. **Begin Interview** - Start answering questions

### Practice Mode

- Text-based Q&A with timer
- Keyword-based scoring
- Immediate feedback
- Progress tracking

### Live Video Mode

- Camera permission required
- Real-time body language analysis
- Visual feedback overlay
- Enhanced scoring with video metrics

### AI Call Mode

- Microphone and camera access
- Live AI interviewer interaction
- Voice-to-voice conversation
- Professional video call interface

## 📈 Scoring System

### Answer Quality (0-100%)

- **Keyword Coverage** (50%) - Relevant terms mentioned
- **Response Length** (25%) - Appropriate detail level
- **Technical Accuracy** (15%) - Correct information
- **Time Management** (10%) - Efficient use of time

### Body Language Score (0-100%)

- **Eye Contact** (30%) - Camera engagement
- **Confidence** (25%) - Overall presence
- **Engagement** (20%) - Active participation
- **Posture** (15%) - Professional appearance
- **Nervousness** (10%) - Stress management

### Overall Performance

Combined score with weighted averages:
- Answer Quality: 70%
- Body Language: 30%

## 🔍 Advanced Features

### Real-time Analysis

```typescript
// Live metrics during interview
const analyzeFrame = async () => {
  // MediaPipe processing
  await faceMeshRef.current.send({ image: canvas });
  await handsRef.current.send({ image: canvas });
  await poseRef.current.send({ image: canvas });
  
  // Update metrics
  updateBodyLanguageMetrics(results);
};
```

### AI Feedback Generation

```typescript
const analyzeAnswer = async (answer, question, bodyLanguage) => {
  const analysis = await interviewService.analyzeAnswer(
    answer, 
    question, 
    bodyLanguage
  );
  
  return {
    score: analysis.answerScore,
    feedback: analysis.feedback,
    recommendations: analysis.recommendations
  };
};
```

### Voice Processing

```typescript
// Speech-to-Text
const transcription = await interviewService.transcribeAudio(audioBlob);

// Text-to-Speech
const audioBuffer = await interviewService.synthesizeSpeech(text);
```

## 📊 Performance Analytics

### Session Tracking

- Question-by-question breakdown
- Time spent per question
- Score progression
- Body language trends

### Historical Analysis

- Performance over time
- Skill improvement tracking
- Weakness identification
- Strength reinforcement

### Detailed Reports

- Comprehensive feedback
- Actionable recommendations
- Comparison with benchmarks
- Next steps guidance

## 🚀 Future Enhancements

### Planned Features

- [ ] Multi-language support
- [ ] Industry-specific questions
- [ ] Team interview simulations
- [ ] VR interview environments
- [ ] Advanced emotion recognition
- [ ] Stress level monitoring
- [ ] Custom question creation
- [ ] Interview recording playback

### Technical Improvements

- [ ] WebRTC optimization
- [ ] Edge computing for analysis
- [ ] Mobile app support
- [ ] Offline mode capability
- [ ] Advanced ML models
- [ ] Real-time coaching
- [ ] Biometric integration
- [ ] AR feedback overlay

## 🔒 Privacy & Security

### Data Protection

- Local video processing
- Encrypted data transmission
- Secure token management
- GDPR compliance
- User consent management

### Privacy Features

- No video storage by default
- Optional session recording
- Data anonymization
- User control over metrics
- Transparent data usage

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Structure

- Follow TypeScript best practices
- Use React hooks for state management
- Implement proper error handling
- Add comprehensive comments
- Write unit tests for utilities

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MediaPipe team for computer vision models
- LiveKit for real-time communication
- OpenAI for AI analysis capabilities
- React and TypeScript communities

---

**Built for the future of interview preparation** 🚀

Transform your interview skills with AI-powered analysis and real-time feedback!