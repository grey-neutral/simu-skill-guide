import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Users, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-3xl mx-auto p-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Interview Simulator
          </h1>
          <p className="text-xl text-muted-foreground">
            Master your interview skills with AI-powered practice sessions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Upload Your CV</h3>
            <p className="text-sm text-muted-foreground">Start by uploading your resume to personalize your practice sessions</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Create Profiles</h3>
            <p className="text-sm text-muted-foreground">Set up profiles for different companies and positions you're targeting</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <ArrowRight className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Practice & Improve</h3>
            <p className="text-sm text-muted-foreground">Get instant feedback and track your progress over time</p>
          </div>
        </div>
        
        <div className="space-y-4 mt-12">
          <Button 
            size="lg" 
            className="w-full max-w-md"
            onClick={() => navigate('/cv-upload')}
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Your CV
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full max-w-md"
            onClick={() => navigate('/job-profiles')}
          >
            <Users className="h-5 w-5 mr-2" />
            Go to Job Profiles
          </Button>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground text-center">
            Follow the steps above to get started with your interview practice
          </p>
        </div>
      </div>
    </div>
  );
}