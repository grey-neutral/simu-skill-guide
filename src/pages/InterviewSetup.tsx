import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PersonaCard } from "@/components/PersonaCard";
import { Clock, Play, FileText, Users, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { interviewAPI, InterviewConfig } from "@/services/api";

// Import persona images
import hrFriendlyImage from "@/assets/persona-hr-friendly.jpg";
import managerCriticalImage from "@/assets/persona-manager-critical.jpg";
import techExpertImage from "@/assets/persona-tech-expert.jpg";
import stressInterviewerImage from "@/assets/persona-stress-interviewer.jpg";
import ceoExecutiveImage from "@/assets/persona-ceo-executive.jpg";

const interviewTypes = [
  { id: "first-round", name: "First Round", description: "Initial screening interview" },
  { id: "final-round", name: "Final Round", description: "Final decision interview" },
  { id: "technical", name: "Technical Interview", description: "Focus on technical skills" },
  { id: "cultural-fit", name: "Cultural Fit", description: "Assess company culture alignment" },
  { id: "general", name: "General Interview", description: "Standard interview format" },
  { id: "salary-negotiation", name: "Salary Negotiation", description: "Practice negotiating compensation" },
];

const interviewLengths = [
  { id: "quick", name: "Quick Intro", duration: "5-10 min", description: "Brief practice session" },
  { id: "standard", name: "Standard", duration: "25-30 min", description: "Typical interview length" },
  { id: "extended", name: "Extended", duration: "45-60 min", description: "Comprehensive interview" },
];

const personas = [
  {
    id: "hr-friendly",
    name: "Sarah Chen",
    description: "Warm and encouraging HR manager who focuses on getting to know you as a person. Creates a comfortable environment to discuss your background and motivations.",
    image: hrFriendlyImage,
    style: "Supportive and conversational",
    difficulty: "Easy" as const,
  },
  {
    id: "manager-critical",
    name: "Robert Martinez",
    description: "Experienced hiring manager with high standards. Asks challenging questions about your experience and expects detailed, well-thought-out responses.",
    image: managerCriticalImage,
    style: "Direct and analytical",
    difficulty: "Hard" as const,
  },
  {
    id: "tech-expert",
    name: "Dr. Emily Watson",
    description: "Technical lead with deep expertise. Focuses on problem-solving abilities, technical knowledge, and how you approach complex challenges.",
    image: techExpertImage,
    style: "Technical and precise",
    difficulty: "Medium" as const,
  },
  {
    id: "stress-interviewer",
    name: "Marcus Thompson",
    description: "Tests your performance under pressure with rapid-fire questions and challenging scenarios. Designed to see how you handle stress and think on your feet.",
    image: stressInterviewerImage,
    style: "Intense and fast-paced",
    difficulty: "Hard" as const,
  },
  {
    id: "ceo-executive",
    name: "James Wilson",
    description: "Senior executive who evaluates strategic thinking and leadership potential. Focuses on big-picture thinking and cultural fit at the executive level.",
    image: ceoExecutiveImage,
    style: "Strategic and visionary",
    difficulty: "Medium" as const,
  },
];

export default function InterviewSetup() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);
  const [cvText, setCvText] = useState<string>("");

  const profileName = profileId === "1" ? "Google Software Engineer" : 
                     profileId === "2" ? "Morgan Stanley Analyst" : 
                     "Unknown Profile";

  const canStartInterview = selectedType && selectedPersona && selectedLength && jobDescription.trim();

  // Load CV text from localStorage on component mount
  useEffect(() => {
    const storedCvText = localStorage.getItem('cvText');
    if (storedCvText) {
      setCvText(storedCvText);
    }
  }, []);

  const handleStartInterview = async () => {
    if (!canStartInterview) {
      toast({
        title: "Missing Information",
        description: "Please complete all sections before starting the interview.",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(true);

    try {
      // Prepare interview configuration for backend
      const interviewConfig: InterviewConfig = {
        persona_id: selectedPersona,
        interview_type: selectedType,
        interview_length: selectedLength,
        job_description: jobDescription.trim(),
        cv_text: cvText || undefined, // Only include if we have CV text
      };

      // Start interview session with backend
      const session = await interviewAPI.startInterview(interviewConfig);

      toast({
        title: "Interview Starting!",
        description: `Session created with ${personas.find(p => p.id === selectedPersona)?.name}`,
      });

      // Navigate to interview interface with session data
      navigate(`/interview/${profileId}`, { 
        state: { 
          sessionId: session.session_id,
          initialGreeting: session.initial_greeting,
          type: selectedType,
          persona: selectedPersona,
          length: selectedLength,
          jobDescription,
          cvText
        } 
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast({
        title: "Failed to Start Interview",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-background overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{profileName}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Interview Setup</h1>
          <p className="text-muted-foreground">Configure your practice interview session</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Interview Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {interviewTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all ${
                        selectedType === type.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium text-sm mb-1">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interview Personas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Choose Your Interviewer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      id={persona.id}
                      name={persona.name}
                      description={persona.description}
                      image={persona.image}
                      style={persona.style}
                      difficulty={persona.difficulty}
                      isSelected={selectedPersona === persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Interview Length */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Interview Length
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviewLengths.map((length) => (
                    <Card
                      key={length.id}
                      className={`cursor-pointer transition-all ${
                        selectedLength === length.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedLength(length.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{length.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {length.duration}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{length.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  {jobDescription.length}/2000 characters
                </div>
              </CardContent>
            </Card>

            {/* Start Interview */}
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Ready to Start?</h3>
                    <div className="text-xs opacity-90 space-y-1">
                      {selectedType && <div>✓ Interview type selected</div>}
                      {selectedPersona && <div>✓ Interviewer selected</div>}
                      {selectedLength && <div>✓ Duration selected</div>}
                      {jobDescription.trim() && <div>✓ Job description provided</div>}
                      {cvText && <div>✓ CV text loaded for personalization</div>}
                      {!cvText && <div className="opacity-60">• No CV uploaded (optional)</div>}
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleStartInterview}
                    disabled={!canStartInterview || isStarting}
                    variant="secondary"
                    className="w-full"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Interview...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Interview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}