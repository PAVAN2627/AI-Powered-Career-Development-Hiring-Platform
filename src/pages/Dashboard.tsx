import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import ResumeScoreCard from "@/components/dashboard/ResumeScoreCard";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import InterviewPrepCard from "@/components/dashboard/InterviewPrepCard";
import SkillsCard from "@/components/dashboard/SkillsCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import StudentMessages from "@/components/dashboard/StudentMessages";
import { FileText, Mic, Target, TrendingUp, Loader2, Trophy, Clock, BarChart3, Zap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface UserStats {
  atsScore: number;
  mockInterviews: number;
  skillsCount: number;
  roadmapProgress: number;
  profileCompleteness: number;
  lastInterviewScore: number;
  totalInterviewTime: number;
  averageScore: number;
  improvementTrend: number;
}

interface InterviewResult {
  role: string;
  difficulty: string;
  questionsAnswered: number;
  totalQuestions: number;
  averageScore: number;
  totalScore: number;
  duration: number;
  timestamp: string;
  type: 'audio' | 'video';
}

const Dashboard = () => {
  const { userProfile, currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<UserStats>({
    atsScore: 0,
    mockInterviews: 0,
    skillsCount: 0,
    roadmapProgress: 0,
    profileCompleteness: 0,
    lastInterviewScore: 0,
    totalInterviewTime: 0,
    averageScore: 0,
    improvementTrend: 0
  });
  const [recentInterviews, setRecentInterviews] = useState<InterviewResult[]>([]);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard render:', { userProfile: !!userProfile, currentUser: !!currentUser, authLoading });

  // Load real-time data
  useEffect(() => {
    const loadRealTimeData = () => {
      try {
        // Load interview results from localStorage
        const interviewResults = JSON.parse(localStorage.getItem('interviewResults') || '[]') as InterviewResult[];
        setRecentInterviews(interviewResults.slice(-5)); // Get last 5 interviews
        
        // Load ATS data from localStorage with user-specific key
        const atsDataKey = userProfile?.uid ? `ats_analysis_${userProfile.uid}` : 'atsAnalysisResult';
        const atsData = localStorage.getItem(atsDataKey) || localStorage.getItem('atsAnalysisResult');
        let atsScore = 0;
        let roadmapInfo = null;
        
        if (atsData) {
          try {
            const parsedAts = JSON.parse(atsData);
            // Handle both old and new data formats
            atsScore = parsedAts.overallScore || parsedAts.score || parsedAts.atsScore || 0;
            roadmapInfo = parsedAts;
            console.log('Loaded ATS data:', { atsScore, parsedAts });
          } catch (e) {
            console.warn('Failed to parse ATS data:', e);
          }
        }
        
        // Calculate interview statistics
        const totalInterviews = interviewResults.length;
        const totalTime = interviewResults.reduce((sum, interview) => sum + (interview.duration || 0), 0);
        const totalScores = interviewResults.reduce((sum, interview) => sum + interview.averageScore, 0);
        const averageScore = totalInterviews > 0 ? Math.round(totalScores / totalInterviews) : 0;
        const lastScore = interviewResults.length > 0 ? interviewResults[interviewResults.length - 1].averageScore : 0;
        
        // Calculate improvement trend (compare last 3 vs previous 3)
        let improvementTrend = 0;
        if (interviewResults.length >= 6) {
          const recent3 = interviewResults.slice(-3);
          const previous3 = interviewResults.slice(-6, -3);
          const recentAvg = recent3.reduce((sum, i) => sum + i.averageScore, 0) / 3;
          const previousAvg = previous3.reduce((sum, i) => sum + i.averageScore, 0) / 3;
          improvementTrend = Math.round(recentAvg - previousAvg);
        }
        
        // Calculate profile completeness
        const profileCompleteness = userProfile ? Math.min(
          (userProfile.displayName ? 15 : 0) +
          (userProfile.email ? 15 : 0) +
          (userProfile.skills?.length > 0 ? 20 : 0) +
          (userProfile.experience ? 15 : 0) +
          (userProfile.bio ? 15 : 0) +
          (userProfile.linkedinUrl ? 10 : 0) +
          (userProfile.githubUrl ? 10 : 0), 100
        ) : 0;
        
        setStats({
          atsScore,
          mockInterviews: totalInterviews,
          skillsCount: userProfile?.skills?.length || 0,
          roadmapProgress: atsScore > 0 ? Math.min(atsScore + 20, 100) : 0,
          profileCompleteness,
          lastInterviewScore: lastScore,
          totalInterviewTime: Math.round(totalTime / 60), // Convert to minutes
          averageScore,
          improvementTrend
        });
        
        setRoadmapData(roadmapInfo);
        
      } catch (error) {
        console.error('Failed to load real-time data:', error);
      }
    };

    if (!authLoading) {
      loadRealTimeData();
      setLoading(false);
      
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(loadRealTimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, userProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No User Profile</h2>
          <p className="text-muted-foreground">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  const firstName = userProfile?.displayName?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      <div className="lg:ml-64 transition-all duration-300">
        <DashboardHeader />
        
        <main className="p-6">
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recruiter Messages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="mb-8">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Here's your real-time career progress and performance analytics
                  </p>
                  {stats.mockInterviews > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Live Data
                      </Badge>
                      <span className="text-muted-foreground">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
            
          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ATS Score */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stats.atsScore > 0 ? 
                    stats.atsScore >= 80 ? 'text-green-600' : 
                    stats.atsScore >= 60 ? 'text-yellow-600' : 'text-red-600' 
                    : 'text-muted-foreground'}`}>
                    {stats.atsScore > 0 ? `${stats.atsScore}%` : 'Not analyzed'}
                  </div>
                  <div className="text-sm text-muted-foreground">ATS Score</div>
                </div>
              </div>
              {stats.atsScore > 0 && (
                <Progress value={stats.atsScore} className="h-2" />
              )}
            </div>
            
            {/* Mock Interviews */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.mockInterviews}</div>
                  <div className="text-sm text-muted-foreground">Mock Interviews</div>
                </div>
              </div>
              {stats.averageScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Avg Score:</span>
                  <span className={`text-sm font-semibold ${
                    stats.averageScore >= 80 ? 'text-green-600' : 
                    stats.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.averageScore}%
                  </span>
                  {stats.improvementTrend !== 0 && (
                    <Badge variant={stats.improvementTrend > 0 ? "default" : "destructive"} className="text-xs">
                      {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Skills */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.skillsCount}</div>
                  <div className="text-sm text-muted-foreground">Skills Added</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.skillsCount < 5 ? 'Add more skills to improve visibility' : 'Great skill diversity!'}
              </div>
            </div>
            
            {/* Practice Time */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalInterviewTime}</div>
                  <div className="text-sm text-muted-foreground">Minutes Practiced</div>
                </div>
              </div>
              {stats.lastInterviewScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Last Score:</span>
                  <span className={`text-sm font-semibold ${
                    stats.lastInterviewScore >= 80 ? 'text-green-600' : 
                    stats.lastInterviewScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.lastInterviewScore}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Interview Performance */}
          {recentInterviews.length > 0 && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Interview Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentInterviews.slice(-3).map((interview, index) => (
                      <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {interview.type === 'video' ? '📹' : '🎤'} {interview.role}
                          </Badge>
                          <span className={`text-sm font-semibold ${
                            interview.averageScore >= 80 ? 'text-green-600' : 
                            interview.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {interview.averageScore}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {interview.questionsAnswered}/{interview.totalQuestions} questions • {Math.round(interview.duration / 60)}min
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(interview.timestamp).toLocaleDateString()}
                        </div>
                        <Progress value={interview.averageScore} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="mb-8">
            <QuickActionsCard />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ResumeScoreCard atsScore={stats.atsScore} roadmapData={roadmapData} />
            <RoadmapCard progress={stats.roadmapProgress} roadmapData={roadmapData} />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <InterviewPrepCard interviewCount={stats.mockInterviews} />
            <SkillsCard skillsCount={stats.skillsCount} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityCard />
            
            {/* Enhanced Profile Completeness */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 text-foreground relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display font-semibold text-xl mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Get Discovered by Recruiters
                </h3>
                <p className="text-muted-foreground mb-6">
                  Complete your profile to increase visibility to 500+ verified recruiters looking for talent like you.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Profile Completeness</span>
                      <span className="text-sm font-semibold">
                        {stats.profileCompleteness}%
                      </span>
                    </div>
                    <Progress value={stats.profileCompleteness} className="h-2 mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {stats.profileCompleteness < 50 ? 'Add more details to boost visibility' :
                       stats.profileCompleteness < 80 ? 'Almost there! Add projects and experience' :
                       'Excellent! Your profile is highly visible'}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <StudentMessages activeTab="inbox" />
          </TabsContent>
        </Tabs>
      </div>
      </main>
    </div>
    </div>
  );
};

export default Dashboard;