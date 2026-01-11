import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { aiService, type ResumeAnalysisResult } from "@/lib/aiService";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Target,
  TrendingUp,
  Download,
  Eye,
  Lightbulb,
  Zap,
  Star,
  BookOpen,
  Award,
  ArrowRight,
  Brain,
  Loader2,
  Plus
} from "lucide-react";

const ATSAnalyzer = () => {
  const { userProfile } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [useTextInput, setUseTextInput] = useState(false);
  const [resumeText, setResumeText] = useState("");

  // Load analysis history from localStorage on component mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem(`ats_analysis_${userProfile?.uid}`);
    if (savedAnalysis) {
      try {
        const parsed = JSON.parse(savedAnalysis);
        setAnalysisResult(parsed.result);
        setAnalysisHistory(parsed.history || []);
      } catch (error) {
        console.error('Error loading saved analysis:', error);
      }
    }
  }, [userProfile?.uid]);

  // Save analysis to localStorage whenever it changes
  useEffect(() => {
    if (analysisResult && userProfile?.uid) {
      const analysisData = {
        result: analysisResult,
        history: analysisHistory,
        timestamp: new Date().toISOString(),
        fileName: uploadedFile?.name || 'Unknown'
      };
      localStorage.setItem(`ats_analysis_${userProfile.uid}`, JSON.stringify(analysisData));
    }
  }, [analysisResult, analysisHistory, userProfile?.uid, uploadedFile?.name]);

  // Save analysis results to user's career roadmap
  const saveToRoadmap = async (result: ResumeAnalysisResult) => {
    if (!userProfile?.uid) return;
    
    try {
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const roadmapRef = doc(db, 'roadmaps', userProfile.uid);
      const existingRoadmap = await getDoc(roadmapRef);
      
      // Create roadmap data structure
      const roadmapData = {
        userId: userProfile.uid,
        lastUpdated: new Date().toISOString(),
        resumeScore: result.overallScore,
        bestMatchRole: result.bestMatch.role,
        targetRoles: userProfile.targetRoles || [],
        skillGaps: {},
        learningPaths: {},
        certifications: {},
        progress: existingRoadmap.exists() ? existingRoadmap.data().progress || {} : {}
      };

      // Organize learning paths by role
      result.roleAnalysis.forEach(role => {
        roadmapData.skillGaps[role.role] = role.missingSkills || [];
        roadmapData.learningPaths[role.role] = result.learningPath.filter(course => 
          course.title.toLowerCase().includes(role.role.toLowerCase()) ||
          role.missingSkills?.some(skill => 
            course.title.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });

      // Add certifications for existing skills
      const existingSkills = userProfile.skills || [];
      existingSkills.forEach(skill => {
        roadmapData.certifications[skill] = generateCertifications(skill);
      });

      await setDoc(roadmapRef, roadmapData, { merge: true });
      
      toast.success("Roadmap Updated!", {
        description: "Your learning path has been saved to Career Roadmap.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving to roadmap:', error);
    }
  };

  // Generate certification recommendations for skills
  const generateCertifications = (skill: string) => {
    const certificationMap: { [key: string]: any[] } = {
      "JavaScript": [
        { name: "JavaScript Institute Certification", provider: "JavaScript Institute", url: "https://js.institute", difficulty: "Intermediate" },
        { name: "Meta Frontend Developer Certificate", provider: "Coursera", url: "https://coursera.org", difficulty: "Beginner" }
      ],
      "React": [
        { name: "React Developer Certification", provider: "Meta", url: "https://coursera.org", difficulty: "Intermediate" },
        { name: "Advanced React Patterns", provider: "Udemy", url: "https://udemy.com", difficulty: "Advanced" }
      ],
      "Python": [
        { name: "Python Institute PCAP", provider: "Python Institute", url: "https://pythoninstitute.org", difficulty: "Intermediate" },
        { name: "Google IT Automation with Python", provider: "Coursera", url: "https://coursera.org", difficulty: "Beginner" }
      ],
      "AWS": [
        { name: "AWS Certified Solutions Architect", provider: "Amazon", url: "https://aws.amazon.com/certification/", difficulty: "Advanced" },
        { name: "AWS Cloud Practitioner", provider: "Amazon", url: "https://aws.amazon.com/certification/", difficulty: "Beginner" }
      ],
      "Docker": [
        { name: "Docker Certified Associate", provider: "Docker", url: "https://docker.com", difficulty: "Intermediate" },
        { name: "Kubernetes Administrator (CKA)", provider: "CNCF", url: "https://cncf.io", difficulty: "Advanced" }
      ]
    };

    return certificationMap[skill] || [
      { name: `${skill} Professional Certificate`, provider: "Industry Standard", url: "#", difficulty: "Intermediate" }
    ];
  };

  // Mark course/certification as started or completed
  const updateProgress = async (itemId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!userProfile?.uid) return;
    
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const roadmapRef = doc(db, 'roadmaps', userProfile.uid);
      await updateDoc(roadmapRef, {
        [`progress.${itemId}`]: {
          status,
          updatedAt: new Date().toISOString()
        }
      });
      
      toast.success("Progress Updated!", {
        description: `Marked as ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Add course/certification to learning path
  const addToLearningPath = async (role: string, resource: any, type: 'course' | 'certification') => {
    if (!userProfile?.uid) return;
    
    try {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const roadmapRef = doc(db, 'roadmaps', userProfile.uid);
      const learningItem = {
        id: `${role}_${type}_${Date.now()}`,
        role,
        type,
        title: resource.title,
        provider: resource.provider,
        url: resource.url,
        duration: resource.duration,
        addedAt: new Date().toISOString(),
        status: 'not_started'
      };
      
      await updateDoc(roadmapRef, {
        [`learningPaths.${role}`]: arrayUnion(learningItem)
      });
      
      toast.success("Added to Learning Path!", {
        description: `${resource.title} has been added to your ${role} learning path`,
      });
      
    } catch (error) {
      console.error('Error adding to learning path:', error);
      toast.error("Failed to add to learning path");
    }
  };

  // Add entire role to learning path
  const addRoleToLearningPath = async (role: any) => {
    if (!userProfile?.uid) return;
    
    try {
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      // Get existing roadmap
      const roadmapRef = doc(db, 'roadmaps', userProfile.uid);
      const existingRoadmap = await getDoc(roadmapRef);
      
      // Generate comprehensive learning materials for this role
      const roleCourses = generateRoleBasedCourses(role);
      const roleCertifications = generateRoleBasedCertifications(role);
      
      const roadmapData = {
        userId: userProfile.uid,
        resumeScore: analysisResult?.overallScore || 0,
        bestMatchRole: role.role,
        selectedRole: role.role,
        targetRoles: [role.role],
        extractedSkills: analysisResult?.extractedSkills || [],
        skillGaps: { [role.role]: role.missingSkills || [] },
        learningPaths: { [role.role]: roleCourses },
        certifications: { [role.role]: roleCertifications },
        progress: existingRoadmap.exists() ? existingRoadmap.data().progress || {} : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(roadmapRef, roadmapData);
      
      toast.success("Role Added to Learning Path!", {
        description: `${role.role} learning materials have been added to your roadmap.`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error adding role to learning path:', error);
      toast.error("Failed to add role to learning path");
    }
  };

  // Generate comprehensive courses for a role
  const generateRoleBasedCourses = (role: any) => {
    const allSkills = [...(role.missingSkills || []), ...(role.existingSkills || [])];
    const courses: any[] = [];
    
    allSkills.forEach(skill => {
      const skillCourses = getSkillCourses(skill);
      courses.push(...skillCourses.map(course => ({
        ...course,
        skill,
        priority: role.missingSkills?.includes(skill) ? 'high' : 'medium'
      })));
    });
    
    return courses;
  };

  // Generate comprehensive certifications for a role
  const generateRoleBasedCertifications = (role: any) => {
    const roleBasedCerts: { [key: string]: any[] } = {
      "Frontend Developer": [
        { name: "Meta Frontend Developer Certificate", provider: "Coursera", url: "https://coursera.org", difficulty: "Intermediate", priority: "high" },
        { name: "Google UX Design Certificate", provider: "Coursera", url: "https://coursera.org", difficulty: "Beginner", priority: "medium" },
        { name: "AWS Certified Cloud Practitioner", provider: "Amazon", url: "https://aws.amazon.com", difficulty: "Beginner", priority: "low" }
      ],
      "Full Stack Developer": [
        { name: "Meta Full-Stack Engineer Certificate", provider: "Coursera", url: "https://coursera.org", difficulty: "Advanced", priority: "high" },
        { name: "AWS Certified Developer", provider: "Amazon", url: "https://aws.amazon.com", difficulty: "Intermediate", priority: "high" },
        { name: "MongoDB Certified Developer", provider: "MongoDB", url: "https://mongodb.com", difficulty: "Intermediate", priority: "medium" }
      ],
      "Backend Developer": [
        { name: "AWS Certified Developer", provider: "Amazon", url: "https://aws.amazon.com", difficulty: "Intermediate", priority: "high" },
        { name: "Docker Certified Associate", provider: "Docker", url: "https://docker.com", difficulty: "Intermediate", priority: "high" },
        { name: "Kubernetes Administrator (CKA)", provider: "CNCF", url: "https://cncf.io", difficulty: "Advanced", priority: "medium" }
      ],
      "DevOps Engineer": [
        { name: "AWS Certified DevOps Engineer", provider: "Amazon", url: "https://aws.amazon.com", difficulty: "Advanced", priority: "high" },
        { name: "Docker Certified Associate", provider: "Docker", url: "https://docker.com", difficulty: "Intermediate", priority: "high" },
        { name: "Kubernetes Administrator (CKA)", provider: "CNCF", url: "https://cncf.io", difficulty: "Advanced", priority: "high" },
        { name: "Terraform Associate", provider: "HashiCorp", url: "https://hashicorp.com", difficulty: "Intermediate", priority: "medium" }
      ],
      "Data Scientist": [
        { name: "Google Data Analytics Certificate", provider: "Coursera", url: "https://coursera.org", difficulty: "Beginner", priority: "high" },
        { name: "AWS Certified Machine Learning", provider: "Amazon", url: "https://aws.amazon.com", difficulty: "Advanced", priority: "high" },
        { name: "Microsoft Azure Data Scientist", provider: "Microsoft", url: "https://microsoft.com", difficulty: "Intermediate", priority: "medium" }
      ]
    };
    
    return roleBasedCerts[role.role] || [
      { name: `${role.role} Professional Certificate`, provider: "Industry Standard", url: "#", difficulty: "Intermediate", priority: "medium" }
    ];
  };

  // Get skill-specific courses
  const getSkillCourses = (skill: string) => {
    const skillCourses: { [key: string]: any[] } = {
      "JavaScript": [
        { title: "JavaScript Fundamentals", provider: "YouTube - Programming with Mosh", url: "https://youtube.com", duration: "3 hours" },
        { title: "Modern JavaScript ES6+", provider: "freeCodeCamp", url: "https://freecodecamp.org", duration: "4 hours" }
      ],
      "React": [
        { title: "React Hooks Complete Guide", provider: "YouTube - Code with Harry", url: "https://youtube.com", duration: "5 hours" },
        { title: "React Projects Tutorial", provider: "YouTube - freeCodeCamp", url: "https://youtube.com", duration: "8 hours" }
      ],
      "TypeScript": [
        { title: "TypeScript Complete Course", provider: "YouTube - Hitesh Choudhary", url: "https://youtube.com", duration: "4 hours" },
        { title: "TypeScript with React", provider: "YouTube - Ben Awad", url: "https://youtube.com", duration: "3 hours" }
      ],
      "Node.js": [
        { title: "Node.js Express Tutorial", provider: "YouTube - Traversy Media", url: "https://youtube.com", duration: "6 hours" },
        { title: "Node.js API Development", provider: "YouTube - Programming with Mosh", url: "https://youtube.com", duration: "8 hours" }
      ],
      "Python": [
        { title: "Python Complete Course", provider: "YouTube - Code with Harry", url: "https://youtube.com", duration: "12 hours" },
        { title: "Python for Beginners", provider: "YouTube - Programming with Mosh", url: "https://youtube.com", duration: "6 hours" }
      ]
    };

    return skillCourses[skill] || [
      { title: `${skill} Complete Course`, provider: "YouTube", url: "https://youtube.com", duration: "4 hours" }
    ];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('document') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        toast.error('Invalid File Type', {
          description: 'Please upload a PDF or Word document (.pdf, .doc, .docx)',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'File size must be less than 10MB',
        });
        return;
      }
      
      // Clear previous analysis when new file is uploaded
      setAnalysisResult(null);
      setAnalysisError("");
      setAnalysisHistory([]);
      
      // Clear saved analysis from localStorage
      if (userProfile?.uid) {
        localStorage.removeItem(`ats_analysis_${userProfile.uid}`);
      }
      
      setUploadedFile(file);
      
      toast.success('File Uploaded', {
        description: `${file.name} uploaded successfully. Click "Analyze with AI" to start analysis.`,
      });
    }
  };

  const analyzeResume = async () => {
    let textToAnalyze = "";
    let parsedDocument = null;
    
    if (useTextInput) {
      if (!resumeText.trim()) {
        toast.error('No Text Provided', {
          description: 'Please paste your resume text in the text area.',
        });
        return;
      }
      textToAnalyze = resumeText.trim();
    } else {
      if (!uploadedFile) {
        toast.error('No File Selected', {
          description: 'Please upload a resume file first.',
        });
        return;
      }
    }
    
    setAnalyzing(true);
    setAnalysisError("");
    
    try {
      // Show progress toast
      toast.info("AI Analysis Started", {
        description: useTextInput ? 
          "Analyzing your pasted resume text with enhanced keyword extraction..." : 
          "Extracting text and analyzing with enhanced keyword matching. This may take 30-60 seconds...",
        duration: 5000,
      });

      // Get resume text and extract keywords
      if (useTextInput) {
        textToAnalyze = resumeText;
      } else {
        // Use enhanced document parser
        const { documentParser } = await import('@/lib/documentParser');
        
        try {
          parsedDocument = await documentParser.parseDocument(uploadedFile!);
          textToAnalyze = parsedDocument.text;
          
          // Analyze skills gap for each target role
          const skillsGapAnalysis = userProfile?.targetRoles?.map(role => {
            return documentParser.analyzeSkillsGap(parsedDocument.skills, role);
          }) || [];
          
          // Store skills gap analysis for later use
          (parsedDocument as any).skillsGapAnalysis = skillsGapAnalysis;
          
          toast.success("Enhanced Extraction Complete", {
            description: `Extracted ${parsedDocument.keywords.length} keywords and ${parsedDocument.skills.length} skills from your ${parsedDocument.metadata.fileType}`,
            duration: 3000,
          });
        } catch (parseError) {
          toast.warning("Using Basic Extraction", {
            description: "Enhanced parsing failed, using basic text extraction method.",
            duration: 3000,
          });
          
          // Fallback to basic extraction
          textToAnalyze = await aiService.extractTextFromFile(uploadedFile!);
        }
      }
      
      if (textToAnalyze.length < 50) {
        throw new Error('Resume text is too short. Please provide more detailed resume content.');
      }

      // Show extracted text length to user
      if (!useTextInput) {
        toast.info("Text Extracted Successfully", {
          description: `Extracted ${textToAnalyze.length} characters from your resume. Sending to AI for analysis...`,
          duration: 3000,
        });
      }

      // Prepare enhanced analysis request
      const analysisRequest = {
        resumeText: textToAnalyze,
        targetRoles: userProfile?.targetRoles || ["Frontend Developer"],
        userSkills: userProfile?.skills || [],
        // Include parsed document data if available
        ...(parsedDocument && {
          extractedKeywords: parsedDocument.keywords,
          extractedSkills: parsedDocument.skills,
          documentMetadata: parsedDocument.metadata
        })
      };

      // Call AI service for analysis
      const result = await aiService.analyzeResume(analysisRequest);
      
      // Enhance result with parsed document data
      if (parsedDocument) {
        result.documentMetadata = parsedDocument.metadata;
        result.enhancedKeywords = parsedDocument.keywords;
        result.enhancedSkills = parsedDocument.skills;
        
        // Use the skills gap analysis we computed earlier
        result.skillsGapAnalysis = (parsedDocument as any).skillsGapAnalysis || [];
      }
      
      // If no skills were extracted, show a warning but continue
      if (!result.extractedSkills || result.extractedSkills.length === 0) {
        toast.warning("Limited Skills Detected", {
          description: "The AI couldn't extract many skills from your resume. This might affect the analysis accuracy.",
          duration: 5000,
        });
      }
      
      setAnalysisResult(result);
      
      // Add to analysis history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fileName: useTextInput ? 'Pasted Text' : uploadedFile!.name,
        overallScore: result.overallScore,
        bestMatch: result.bestMatch,
        targetRoles: analysisRequest.targetRoles
      };
      setAnalysisHistory(prev => [historyEntry, ...prev.slice(0, 4)]); // Keep last 5 analyses
      
      // Save learning path to user's roadmap in Firebase
      await saveToRoadmap(result);
      
      // Trigger dashboard refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('roadmapUpdated'));
      
      // Show success toast
      toast.success("AI Analysis Complete!", {
        description: `Your resume scored ${result.overallScore}% ATS compatibility. Best match: ${result.bestMatch.role} (${result.bestMatch.score}%)${
          result.enhancedKeywords ? ` • Enhanced parsing extracted ${result.enhancedKeywords.length} keywords` : ''
        }`,
        duration: 8000,
      });
      
    } catch (error: any) {
      const errorMessage = error.message || "Analysis failed. Please try again.";
      setAnalysisError(errorMessage);
      
      toast.error("Analysis Failed", {
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    return 'text-destructive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'needs-improvement': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:ml-64 transition-all duration-300">
        <DashboardHeader />
        
        <main className="p-6">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              ATS Resume Analyzer
            </h1>
            <p className="text-muted-foreground">
              Upload your resume to get detailed ATS compatibility analysis and improvement suggestions
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input Method Toggle */}
                  <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inputMethod"
                        checked={!useTextInput}
                        onChange={() => {
                          setUseTextInput(false);
                          setResumeText("");
                          setAnalysisResult(null);
                          setAnalysisError("");
                        }}
                        className="text-primary"
                      />
                      <span className="text-sm font-medium">Upload File</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inputMethod"
                        checked={useTextInput}
                        onChange={() => {
                          setUseTextInput(true);
                          setUploadedFile(null);
                          setAnalysisResult(null);
                          setAnalysisError("");
                        }}
                        className="text-primary"
                      />
                      <span className="text-sm font-medium">Paste Text</span>
                    </label>
                  </div>

                  {!useTextInput ? (
                    // File Upload Section
                    <>
                      <div>
                        <Label htmlFor="resume-upload">Select Resume File</Label>
                        <Input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="mt-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <p>Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                          <p className="text-amber-600">
                            <strong>💡 Best results:</strong> Use Word documents (.docx) or PDFs with selectable text
                          </p>
                        </div>
                      </div>

                      {uploadedFile && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">{uploadedFile.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    // Text Input Section
                    <div>
                      <Label htmlFor="resume-text">Paste Your Resume Text</Label>
                      <textarea
                        id="resume-text"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your complete resume text here...

Example:
John Doe
Software Engineer
Email: john@example.com

EXPERIENCE
Software Developer at ABC Company (2020-2023)
- Developed web applications using React, Node.js, and MongoDB
- Implemented CI/CD pipelines using Jenkins and Docker
- Collaborated with cross-functional teams using Agile methodology

SKILLS
Programming: JavaScript, Python, Java, TypeScript
Frontend: React, Angular, HTML5, CSS3, Bootstrap
Backend: Node.js, Express, Django, REST APIs
Database: MongoDB, MySQL, PostgreSQL
Tools: Git, Docker, AWS, JIRA"
                        className="mt-2 min-h-[300px] text-sm font-mono"
                        rows={15}
                      />
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <p>Characters: {resumeText.length} (minimum 100 recommended)</p>
                        <p className="text-green-600">
                          <strong>💡 Tip:</strong> Include all sections: contact info, experience, skills, education
                        </p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={analyzeResume}
                    disabled={(!uploadedFile && !useTextInput) || (useTextInput && resumeText.length < 50) || analyzing}
                    className="w-full"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze with AI (GPT-4.1)
                      </>
                    )}
                  </Button>

                  {analysisError && (
                    <Alert className="mt-4 border-destructive/50 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Analysis Error:</strong> {analysisError}
                        {analysisError.includes('PDF') && (
                          <div className="mt-2 text-sm">
                            <strong>💡 Suggestions:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Convert your PDF to a Word document (.docx)</li>
                              <li>Use a PDF with selectable text (not scanned images)</li>
                              <li>Try copying your resume text into a new document</li>
                              <li>Ensure you have uploaded a valid resume file</li>
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* AI Analysis Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI-Powered Analysis
                    {/* API Status Indicator */}
                    <div className="ml-auto">
                      {import.meta.env.VITE_AZURE_OPENAI_KEY ? (
                        <Badge variant="default" className="bg-green-500 text-white">
                          API Ready
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          API Not Configured
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Powered by Azure OpenAI GPT-4.1 for intelligent resume analysis</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Role-specific scoring based on your target careers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Personalized learning recommendations</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Career path suggestions based on your skills</p>
                  </div>
                  
                  {!import.meta.env.VITE_AZURE_OPENAI_KEY && (
                    <Alert className="mt-4 border-destructive/50 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Azure OpenAI API is not configured. Please contact support to enable AI analysis.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Analysis History */}
              {analysisHistory.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      Analysis History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysisHistory.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{entry.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString()} • 
                              Best: {entry.bestMatch.role} ({entry.bestMatch.score}%)
                            </p>
                          </div>
                        </div>
                        <Badge variant={entry.overallScore >= 80 ? "default" : entry.overallScore >= 60 ? "secondary" : "outline"}>
                          {entry.overallScore}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* ATS Tips */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">ATS Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Use standard section headings like "Experience" and "Education"</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Include relevant keywords from the job description</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Avoid images, graphics, and complex formatting</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                    <p className="text-sm">Use simple, clean fonts and layouts</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-2">
              {!analysisResult ? (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                    <p className="text-muted-foreground">
                      Upload your resume to get detailed ATS compatibility analysis
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>ATS Compatibility Score</span>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {analysisResult.overallScore}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <Progress value={analysisResult.overallScore} className="h-3" />
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                          {analysisResult.overallScore}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.overallScore >= 80 ? 'Excellent! Your resume is highly ATS-compatible.' :
                         analysisResult.overallScore >= 60 ? 'Good score, but there\'s room for improvement.' :
                         'Your resume needs significant optimization for ATS systems.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Role Match Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Role Compatibility Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Best Match */}
                        <div className="p-4 border rounded-lg bg-accent/5 border-accent">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-accent" />
                            <h3 className="font-semibold">Best Match</h3>
                          </div>
                          <p className="font-medium text-lg">{analysisResult.bestMatch.role}</p>
                          <Badge variant="default" className="mt-2">
                            {analysisResult.bestMatch.score}% Match
                          </Badge>
                        </div>

                        {/* Your Top Target */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Your Top Target</h3>
                          <p className="font-medium text-lg">{analysisResult.roleAnalysis[0]?.role}</p>
                          <Badge variant={analysisResult.roleAnalysis[0]?.score >= 70 ? "default" : "secondary"} className="mt-2">
                            {analysisResult.roleAnalysis[0]?.score}% Match
                          </Badge>
                        </div>

                        {/* Skills Found */}
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Skills Detected</h3>
                          <p className="text-2xl font-bold text-primary">{analysisResult.extractedSkills.length}</p>
                          <p className="text-sm text-muted-foreground">From your resume</p>
                        </div>
                      </div>

                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          Click on the <strong>"Role Match"</strong> tab below for detailed analysis of each role compatibility.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="roles" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="roles">Role Match</TabsTrigger>
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="strengths">Strengths</TabsTrigger>
                      <TabsTrigger value="weaknesses">Improve</TabsTrigger>
                      <TabsTrigger value="keywords">Keywords</TabsTrigger>
                      <TabsTrigger value="learning">Learning Path</TabsTrigger>
                    </TabsList>

                    <TabsContent value="roles" className="space-y-6">
                      {/* Your Target Roles Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Your Target Roles Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {analysisResult.roleAnalysis.map((role: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-lg">{role.role}</h4>
                                <Badge variant={role.score >= 70 ? "default" : role.score >= 50 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                                  {role.score}% Match
                                </Badge>
                              </div>
                              <Progress value={role.score} className="h-3 mb-4" />
                              
                              {/* Detailed Match Breakdown */}
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Required Skills</span>
                                    <span className="text-sm text-muted-foreground">
                                      {role.requiredMatched}/{role.totalRequired}
                                    </span>
                                  </div>
                                  <Progress value={(role.requiredMatched / role.totalRequired) * 100} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Preferred Skills</span>
                                    <span className="text-sm text-muted-foreground">
                                      {role.preferredMatched}/{role.totalPreferred}
                                    </span>
                                  </div>
                                  <Progress value={(role.preferredMatched / role.totalPreferred) * 100} className="h-2" />
                                </div>
                              </div>

                              {/* Matched Skills with Details */}
                              {role.matchDetails && role.matchDetails.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-medium mb-2 text-success">✅ Matched Skills ({role.matchedSkills.length})</h5>
                                  <div className="space-y-2">
                                    {role.matchDetails.map((match: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-success/5 rounded border border-success/20">
                                        <div className="flex items-center gap-2">
                                          <Badge variant={match.category === 'required' ? 'default' : 'secondary'} className="text-xs">
                                            {match.category}
                                          </Badge>
                                          <span className="font-medium text-sm">{match.skill}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {match.found.map((found: string) => (
                                            <Badge key={found} variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                              {found}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Missing Skills */}
                              {role.missingSkills && role.missingSkills.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-2 text-destructive">❌ Missing Required Skills ({role.missingSkills.length})</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {role.missingSkills.map((skill: string) => (
                                      <Badge key={skill} variant="outline" className="border-destructive text-destructive">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Best Role Matches */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-accent" />
                            Best Role Matches for Your Resume
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analysisResult.allRoleAnalysis.map((role: any, index: number) => (
                              <div key={index} className={`p-3 rounded-lg border ${
                                index === 0 ? 'bg-accent/5 border-accent' : 'bg-muted/30'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {index === 0 && <Star className="w-4 h-4 text-accent" />}
                                    <div>
                                      <h4 className="font-medium">{role.role}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {role.requiredMatched}/{role.totalRequired} required • {role.preferredMatched}/{role.totalPreferred} preferred
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant={role.score >= 70 ? "default" : role.score >= 50 ? "secondary" : "outline"}>
                                      {role.score}%
                                    </Badge>
                                    {index === 0 && (
                                      <p className="text-xs text-accent font-medium mt-1">Best Match</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {analysisResult.suggestedRole && (
                            <Alert className="mt-4">
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Recommendation:</strong> Consider exploring <strong>{analysisResult.bestMatch.role}</strong> - 
                                you have a {analysisResult.bestMatch.score}% match! This role might be a better fit than your current targets.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="sections" className="space-y-4">
                      {Object.entries(analysisResult.sections).map(([section, data]: [string, any]) => (
                        <Card key={section}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(data.status)}
                                <h3 className="font-semibold capitalize">{section.replace(/([A-Z])/g, ' $1')}</h3>
                              </div>
                              <Badge variant="outline" className={getScoreColor(data.score)}>
                                {data.score}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{data.feedback}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="strengths" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            Resume Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResult.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="weaknesses" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-6">
                            {analysisResult.weaknesses.map((weakness: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-accent" />
                              Improvement Suggestions
                            </h4>
                            <ul className="space-y-2">
                              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Zap className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-4">
                      {/* Enhanced Document Analysis Status */}
                      {analysisResult.documentMetadata && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            <strong>Enhanced Document Analysis Complete!</strong> 
                            <br />• File type: {analysisResult.documentMetadata.fileType} ({analysisResult.documentMetadata.extractionMethod})
                            <br />• Document length: {analysisResult.documentMetadata.wordCount} words
                            {analysisResult.documentMetadata.pageCount && <span> • Pages: {analysisResult.documentMetadata.pageCount}</span>}
                            <br />• Enhanced keywords extracted: {analysisResult.enhancedKeywords?.length || 0}
                            <br />• Technical skills identified: {analysisResult.enhancedSkills?.length || 0}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Enhanced Keywords Section */}
                      {analysisResult.enhancedKeywords && analysisResult.enhancedKeywords.length > 0 && (
                        <Card className="border-accent">
                          <CardHeader>
                            <CardTitle className="text-accent flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Enhanced Keywords Extracted ({analysisResult.enhancedKeywords.length})
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Advanced document parsing found these keywords and skills in your resume
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.enhancedKeywords.map((keyword: string) => (
                                <Badge key={keyword} variant="default" className="bg-accent/80 text-white">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Skills Gap Analysis */}
                      {analysisResult.skillsGapAnalysis && analysisResult.skillsGapAnalysis.length > 0 && (
                        <Card className="border-primary">
                          <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Skills Gap Analysis
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Detailed analysis of your skills vs. target role requirements
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {analysisResult.skillsGapAnalysis.map((analysis: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold">Target Role Analysis</h4>
                                  <Badge variant="default" className="bg-primary">
                                    {analysis.matchPercentage}% Match
                                  </Badge>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <h5 className="font-medium text-success mb-2">✅ Matching Skills ({analysis.matchingSkills.length})</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {analysis.matchingSkills.map((skill: string) => (
                                        <Badge key={skill} variant="secondary" className="bg-success/10 text-success text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-destructive mb-2">❌ Missing Skills ({analysis.missingSkills.length})</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {analysis.missingSkills.map((skill: string) => (
                                        <Badge key={skill} variant="outline" className="border-destructive text-destructive text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {analysis.recommendations && analysis.recommendations.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                      <Lightbulb className="w-4 h-4 text-accent" />
                                      Recommendations
                                    </h5>
                                    <ul className="space-y-1">
                                      {analysis.recommendations.map((rec: string, recIndex: number) => (
                                        <li key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <ArrowRight className="w-3 h-3 mt-0.5 text-accent flex-shrink-0" />
                                          {rec}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-success flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Found Keywords ({analysisResult.keywordAnalysis.found.length})
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Skills from your resume that match your target roles
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.keywordAnalysis.found.map((keyword: string) => (
                                <Badge key={keyword} variant="secondary" className="bg-success/10 text-success">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            {analysisResult.keywordAnalysis.found.length === 0 && (
                              <p className="text-sm text-muted-foreground italic">
                                No matching keywords found between your resume and target roles.
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                              <XCircle className="w-5 h-5" />
                              Missing Keywords ({analysisResult.keywordAnalysis.missing.length})
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Important skills for your target roles that are missing from your resume
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.keywordAnalysis.missing.map((keyword: string) => (
                                <Badge key={keyword} variant="outline" className="border-destructive text-destructive">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                              Consider adding these keywords to improve ATS compatibility for your target roles
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Keyword Density Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Current Density</span>
                                <span>{analysisResult.keywordAnalysis.density}%</span>
                              </div>
                              <Progress value={Math.min(analysisResult.keywordAnalysis.density * 2.5, 100)} className="h-2" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Target: 40-60%
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">
                            Keyword density shows what percentage of important skills for your target roles are present in your resume.
                          </p>
                        </CardContent>
                      </Card>

                      {/* All Extracted Skills */}
                      <Card className="border-dashed border-accent">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" />
                            All Technical Skills Detected ({analysisResult.extractedSkills.length})
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-2">
                            These are all the technical skills, frameworks, tools, and platforms found in your resume. 
                            <br />If skills are missing, ensure they are clearly mentioned in your document.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysisResult.extractedSkills.length > 0 ? (
                            <>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.extractedSkills.map((skill: string) => (
                                  <Badge key={skill} variant="default" className="text-xs bg-accent/80">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg space-y-2">
                              <p className="text-sm text-destructive font-medium">⚠️ No skills detected in your resume</p>
                              <p className="text-xs text-muted-foreground">
                                This might indicate:
                              </p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                <li>PDF/document extraction issue - try a Word document (.docx)</li>
                                <li>Skills not clearly mentioned - use proper formatting for skill sections</li>
                                <li>Skills written in unusual format - try standard skill names</li>
                                <li>File corruption - try uploading the file again</li>
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="learning" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Personalized Learning Path
                            <Button variant="outline" size="sm" className="ml-auto" asChild>
                              <Link to="/dashboard/roadmap?tab=courses">
                                <ArrowRight className="w-4 h-4 mr-1" />
                                View Learning Path
                              </Link>
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-6">
                            Based on your resume analysis and target roles, here are recommended courses and certifications. 
                            Progress is automatically saved to your Career Roadmap.
                          </p>
                          
                          {/* Role-wise Learning Paths */}
                          <div className="space-y-6">
                            {analysisResult.roleAnalysis.map((role: any, roleIndex: number) => (
                              <div key={roleIndex} className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <Target className="w-6 h-6 text-primary" />
                                    <div>
                                      <h3 className="font-semibold text-lg">{role.role}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {role.missingSkills?.length || 0} skills to learn • {generateRoleBasedCourses(role).length} courses • {generateRoleBasedCertifications(role).length} certifications
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant={role.score >= 70 ? "default" : "secondary"} className="text-sm px-3 py-1">
                                      {role.score}% Match
                                    </Badge>
                                    <Button 
                                      onClick={() => addRoleToLearningPath(role)}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Select & Add to Learning Path
                                    </Button>
                                  </div>
                                </div>

                                {/* Skill Gaps Preview */}
                                {role.missingSkills && role.missingSkills.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium text-sm mb-2 text-destructive">
                                      🎯 Skills to Learn ({role.missingSkills.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {role.missingSkills.slice(0, 6).map((skill: string) => (
                                        <Badge key={skill} variant="outline" className="border-destructive text-destructive">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {role.missingSkills.length > 6 && (
                                        <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                                          +{role.missingSkills.length - 6} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Learning Resources Preview */}
                                <div className="grid md:grid-cols-3 gap-3">
                                  {generateRoleBasedCourses(role).slice(0, 3).map((course, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-white hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <Badge variant="secondary" className="text-xs">
                                          Course
                                        </Badge>
                                        {course.priority === 'high' && (
                                          <Badge variant="destructive" className="text-xs">
                                            Priority
                                          </Badge>
                                        )}
                                      </div>
                                      <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
                                      <p className="text-xs text-muted-foreground">{course.provider}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Certifications Preview */}
                                <div className="mt-4">
                                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-green-500" />
                                    Required Certifications ({generateRoleBasedCertifications(role).length})
                                  </h4>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    {generateRoleBasedCertifications(role).slice(0, 3).map((cert, index) => (
                                      <div key={index} className="p-3 border rounded-lg bg-green-50 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Award className="w-4 h-4 text-green-500" />
                                          <Badge variant="default" className="text-xs bg-green-500">
                                            {cert.difficulty}
                                          </Badge>
                                          {cert.priority === 'high' && (
                                            <Badge variant="destructive" className="text-xs">
                                              Priority
                                            </Badge>
                                          )}
                                        </div>
                                        <h4 className="font-semibold text-sm mb-1">{cert.name}</h4>
                                        <p className="text-xs text-muted-foreground">{cert.provider}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          
                          <Alert className="mt-6">
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Pro Tip:</strong> Select a role that matches your career goals and add all its learning materials to your roadmap for structured progress tracking.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Generate PDF report
                        const reportContent = `
ATS Resume Analysis Report
Generated on: ${new Date().toLocaleDateString()}

Overall ATS Score: ${analysisResult.overallScore}%
Best Match Role: ${analysisResult.bestMatch.role} (${analysisResult.bestMatch.score}%)

Skills Detected (${analysisResult.extractedSkills.length}):
${analysisResult.extractedSkills.join(', ')}

Target Role Analysis:
${analysisResult.roleAnalysis.map(role => 
  `${role.role}: ${role.score}% match (${role.requiredMatched}/${role.totalRequired} required skills)`
).join('\n')}

Strengths:
${analysisResult.strengths.map(s => `• ${s}`).join('\n')}

Areas for Improvement:
${analysisResult.weaknesses.map(w => `• ${w}`).join('\n')}

Recommendations:
${analysisResult.suggestions.map(s => `• ${s}`).join('\n')}
                        `;
                        
                        const blob = new Blob([reportContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ATS_Analysis_Report_${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast.success("Report Downloaded", {
                          description: "Your ATS analysis report has been downloaded as a text file.",
                        });
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button asChild>
                      <Link to="/resume-builder">
                        <Eye className="w-4 h-4 mr-2" />
                        Optimize Resume
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ATSAnalyzer;