import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Award, Target, Calendar, BarChart3 } from "lucide-react";

const mockData = {
  totalInterviews: 24,
  totalHours: 12.5,
  averageScore: 7.8,
  recentSessions: [
    {
      id: 1,
      profileName: "Google Software Engineer",
      interviewer: "Dr. Emily Watson",
      date: "2024-01-20",
      duration: "30 min",
      overallScore: 8.2,
      confidence: 8.5,
      clarity: 7.8,
      technical: 8.7,
    },
    {
      id: 2,
      profileName: "Morgan Stanley Analyst",
      interviewer: "Robert Martinez",
      date: "2024-01-18",
      duration: "25 min",
      overallScore: 7.1,
      confidence: 6.8,
      clarity: 7.5,
      technical: 7.0,
    },
    {
      id: 3,
      profileName: "Google Software Engineer",
      interviewer: "Sarah Chen",
      date: "2024-01-15",
      duration: "45 min",
      overallScore: 8.9,
      confidence: 9.2,
      clarity: 8.7,
      technical: 8.8,
    },
  ],
  skillProgress: [
    { skill: "Confidence", current: 8.2, previous: 7.1, trend: "up" },
    { skill: "Clarity", current: 7.8, previous: 8.0, trend: "down" },
    { skill: "Technical", current: 8.1, previous: 7.9, trend: "up" },
    { skill: "Problem Solving", current: 7.9, previous: 7.5, trend: "up" },
  ]
};

export default function Progression() {
  return (
    <div className="flex-1 p-8 bg-background overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground">Track your interview performance and skill development</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Interviews</p>
                  <p className="text-2xl font-bold text-foreground">{mockData.totalInterviews}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Practice Hours</p>
                  <p className="text-2xl font-bold text-foreground">{mockData.totalHours}h</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{mockData.averageScore}/10</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{session.profileName}</h4>
                        <p className="text-sm text-muted-foreground">with {session.interviewer}</p>
                      </div>
                      <Badge 
                        variant={session.overallScore >= 8 ? "default" : session.overallScore >= 7 ? "secondary" : "outline"}
                      >
                        {session.overallScore}/10
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.date}</span>
                      <span>{session.duration}</span>
                    </div>
                    
                    <div className="mt-3 flex gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-1 font-medium">{session.confidence}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clarity:</span>
                        <span className="ml-1 font-medium">{session.clarity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Technical:</span>
                        <span className="ml-1 font-medium">{session.technical}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Skill Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockData.skillProgress.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {skill.previous} → {skill.current}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          skill.trend === "up" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          <TrendingUp className={`w-2 h-2 ${
                            skill.trend === "up" 
                              ? "text-green-600" 
                              : "text-red-600 rotate-180"
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(skill.current / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-accent rounded-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">First Perfect Score</p>
                  <p className="text-xs text-white/80">Scored 10/10 in Technical Interview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Consistency Streak</p>
                  <p className="text-xs text-muted-foreground">5 sessions above 8.0 score</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Dedication Badge</p>
                  <p className="text-xs text-muted-foreground">10+ hours of practice</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}