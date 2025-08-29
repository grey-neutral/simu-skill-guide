import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Clock,
  Star
} from "lucide-react";

export default function Feedback() {
  const { profileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const interviewData = location.state;
  
  // Mock feedback data (in real app, this would come from AI analysis)
  const feedback = {
    overallScore: 78,
    scores: {
      confidence: 82,
      clarity: 75,
      technical: 80,
      culturalFit: 76,
    },
    strengths: [
      "Clear communication and articulation of ideas",
      "Strong technical knowledge demonstrated",
      "Good examples provided from past experience",
      "Confident body language and tone",
    ],
    weaknesses: [
      "Could provide more specific metrics in examples",
      "Some responses were too brief - elaborate more",
      "Nervousness showed in the beginning",
      "Could ask more questions about the role",
    ],
    recommendations: [
      "Practice the STAR method for behavioral questions",
      "Prepare 2-3 detailed stories showcasing your achievements",
      "Research the company culture more thoroughly",
      "Work on asking thoughtful questions at the end",
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (!interviewData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Feedback Not Available</h2>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <div className="flex-1 p-8 bg-background overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}  
            className="mb-4"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Interview Complete</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Interview Feedback</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration: {formatDuration(interviewData.duration || 1800)}
              </div>
              <Badge variant="outline" className="capitalize">
                {interviewData.type?.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {feedback.overallScore}%
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Overall Performance</h3>
                <p className="text-muted-foreground">
                  {feedback.overallScore >= 80 ? "Excellent job! You performed very well in this interview." :
                   feedback.overallScore >= 60 ? "Good performance with room for improvement." :
                   "There's significant room for improvement. Keep practicing!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(feedback.scores).map(([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant={getScoreVariant(score)} className={getScoreColor(score)}>
                      {score}%
                    </Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Lightbulb className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => navigate('/progression')}
            variant="outline"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Progress History
          </Button>
          
          <Button
            onClick={() => navigate('/job-profiles')}
          >
            <Users className="h-4 w-4 mr-2" />
            Back to Job Profiles
          </Button>
          
          <Button
            onClick={() => navigate(`/profile/${profileId}`)}
            variant="secondary"
          >
            Practice Again
          </Button>
        </div>
      </div>
    </div>
  );
}