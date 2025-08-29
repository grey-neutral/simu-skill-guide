import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Timer, Send, Square, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import persona images
import hrFriendlyImage from "@/assets/persona-hr-friendly.jpg";
import managerCriticalImage from "@/assets/persona-manager-critical.jpg";
import techExpertImage from "@/assets/persona-tech-expert.jpg";
import stressInterviewerImage from "@/assets/persona-stress-interviewer.jpg";
import ceoExecutiveImage from "@/assets/persona-ceo-executive.jpg";

const personas = {
  "hr-friendly": {
    name: "Sarah Chen",
    image: hrFriendlyImage,
    style: "Supportive and conversational",
  },
  "manager-critical": {
    name: "Robert Martinez",
    image: managerCriticalImage,
    style: "Direct and analytical",
  },
  "tech-expert": {
    name: "Dr. Emily Watson",
    image: techExpertImage,
    style: "Technical and precise",
  },
  "stress-interviewer": {
    name: "Marcus Thompson",
    image: stressInterviewerImage,
    style: "Intense and fast-paced",
  },
  "ceo-executive": {
    name: "James Wilson",
    image: ceoExecutiveImage,
    style: "Strategic and visionary",
  },
};

const interviewLengths = {
  quick: 600, // 10 minutes
  standard: 1800, // 30 minutes
  extended: 3600, // 60 minutes
};

interface Message {
  id: string;
  sender: 'interviewer' | 'user';
  content: string;
  timestamp: Date;
}

export default function InterviewInterface() {
  const { profileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const interviewData = location.state;
  const persona = personas[interviewData?.persona as keyof typeof personas];
  const initialTime = interviewLengths[interviewData?.length as keyof typeof interviewLengths] || 1800;
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "interviewer",
      content: `Hello! I'm ${persona?.name || "your interviewer"}. Thank you for taking the time to speak with me today. I'm excited to learn more about you and your background. Let's start with a simple question: Could you please tell me a bit about yourself and what drew you to apply for this position?`,
      timestamp: new Date(),
    }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate AI speaking animation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'interviewer') {
      setIsSpeaking(true);
      const speakingDuration = Math.min(lastMessage.content.length * 50, 5000); // Max 5 seconds
      const timer = setTimeout(() => setIsSpeaking(false), speakingDuration);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's interesting. Can you tell me more about how you handled challenges in that role?",
        "I see. What would you say is your greatest strength when working in a team environment?",
        "Thank you for sharing that. How do you typically approach problem-solving in your work?",
        "That's a great example. Can you walk me through a specific situation where you had to adapt quickly?",
        "Excellent. What do you know about our company culture and how do you see yourself fitting in?",
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleEndInterview = () => {
    navigate(`/feedback/${profileId}`, {
      state: {
        ...interviewData,
        messages,
        duration: initialTime - timeLeft,
      }
    });
  };

  if (!interviewData || !persona) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Interview Not Found</h2>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Timer className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndInterview}
            >
              <Square className="h-4 w-4 mr-2" />
              End Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persona Section */}
        <div className="w-80 bg-card border-r border-border p-6 flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={persona.image}
              alt={persona.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-border"
            />
            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-current rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="ml-1">Speaking</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{persona.name}</h2>
            <p className="text-sm text-muted-foreground">{persona.style}</p>
          </div>
          
          <div className="mt-auto pt-6 space-y-2 text-center">
            <div className="text-xs text-muted-foreground">Interview Type</div>
            <Badge variant="secondary" className="capitalize">
              {interviewData.type.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-6">
            <div className="flex gap-3">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your response..."
                className="min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}