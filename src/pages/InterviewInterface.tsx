import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Square, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { interviewAPI } from "@/services/api";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const sessionId = interviewData?.sessionId || null;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInterimTranscript, setUserInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(false);

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

  // Initialize with initial greeting from backend
  useEffect(() => {
    if (interviewData?.initialGreeting && messages.length === 0) {
      const initialMessage: Message = {
        id: "initial",
        sender: "interviewer",
        content: interviewData.initialGreeting,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [interviewData, messages.length]);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognitionImpl: typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionImpl) {
      // @ts-ignore
      const recognition: SpeechRecognition = new SpeechRecognitionImpl();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setUserInterimTranscript("");
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
        // If we ended without final transcript, do nothing
      };
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        if (interimTranscript) {
          setUserInterimTranscript(interimTranscript);
        }
        if (finalTranscript.trim()) {
          setUserInterimTranscript("");
          const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            content: finalTranscript.trim(),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          // After user speaks, get real AI response from backend
          handleUserMessage(finalTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        title: 'Speech Recognition unavailable',
        description: 'Your browser does not support speech-to-text. Please use Chrome.',
        variant: 'destructive',
      });
    }

    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  // Speak interviewer messages via Speech Synthesis
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.sender !== 'interviewer') return;

    const utterance = new SpeechSynthesisUtterance(lastMessage.content);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => {
      setIsSpeaking(false);
      // After TTS ends, start listening for user response
      startListening();
    };

    utterance.onstart = handleStart;
    utterance.onend = handleEnd;
    utterance.onerror = () => setIsSpeaking(false);

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // If TTS not available, just toggle states with a timeout fallback
      setIsSpeaking(true);
      const duration = Math.min(lastMessage.content.length * 50, 4000);
      setTimeout(() => handleEnd(), duration);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = () => {
    // Do not start if recognition unsupported
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
    } catch {}
    try {
      recognitionRef.current.start();
    } catch {}
  };

  const handleUserMessage = async (content: string) => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "No interview session found. Please restart the interview.",
        variant: "destructive",
      });
      return;
    }

    setIsTyping(true);
    
    try {
      const response = await interviewAPI.sendMessage(sessionId, content);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        content: response.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Communication Error",
        description: "Failed to get interviewer response. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to a generic response to keep the interview flowing
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'interviewer',
        content: "I apologize, I'm having a brief technical issue. Could you please repeat your last response?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) {
      navigate(`/feedback/${profileId}`, {
        state: {
          ...interviewData,
          messages,
          duration: initialTime - timeLeft,
          sessionId: null,
        }
      });
      return;
    }

    try {
      // Stop the interview session and get feedback from backend
      const feedback = await interviewAPI.stopInterview(sessionId);
      
      navigate(`/feedback/${profileId}`, {
        state: {
          ...interviewData,
          messages,
          duration: initialTime - timeLeft,
          sessionId,
          backendFeedback: feedback,
        }
      });
    } catch (error) {
      console.error('Failed to stop interview:', error);
      toast({
        title: "Error Ending Interview",
        description: "There was an issue processing your interview. Proceeding to feedback.",
        variant: "destructive",
      });
      
      // Navigate to feedback anyway with available data
      navigate(`/feedback/${profileId}`, {
        state: {
          ...interviewData,
          messages,
          duration: initialTime - timeLeft,
          sessionId,
          backendFeedback: null,
        }
      });
    }
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
            variant="destructive"
            size="sm"
            onClick={handleEndInterview}
          >
            <Square className="h-4 w-4 mr-2" />
            End Interview
          </Button>

          <Badge variant="outline" className="flex items-center gap-2">
            <Timer className="h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Persona Top Section */}
        <div className="px-6 pt-8 pb-4 flex flex-col items-center gap-3">
          <img
            src={persona.image}
            alt={persona.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-border"
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{persona.name}</h2>
            <p className="text-sm text-muted-foreground">{persona.style}</p>
          </div>

          {/* Animated voice lines when speaking */}
          <div className="h-8 flex items-end gap-1 mt-2" aria-hidden>
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-sm ${isSpeaking ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                style={{
                  height: isSpeaking ? `${4 + ((i * 7) % 24)}px` : '4px',
                  animation: isSpeaking ? `bounce-${(i % 5) + 1} 1.2s infinite ease-in-out` as any : undefined,
                }}
              />
            ))}
          </div>

          {/* Interviewer transcript (subtle) */}
          <div className="max-w-3xl text-center text-xs text-muted-foreground mt-1">
            {messages.filter(m => m.sender === 'interviewer').slice(-1)[0]?.content}
          </div>

          {/* Listening indicator */}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            {isListening ? 'Listening for your response…' : 'Waiting…'}
          </div>
        </div>

        {/* Transcript feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground text-xs opacity-90'
                }`}
              >
                <p className={`${message.sender === 'user' ? 'text-sm' : 'text-xs'}`}>{message.content}</p>
                <div className="text-[10px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Live interim user transcript */}
          {isListening && userInterimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[70%] p-3 rounded-lg border border-primary/40 text-foreground">
                <p className="text-sm opacity-80">{userInterimTranscript}</p>
                <div className="text-[10px] opacity-60 mt-1">Speaking…</div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local keyframes for waveform animation */}
      <style>{`
        @keyframes bounce-1 { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
        @keyframes bounce-2 { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1)} }
        @keyframes bounce-3 { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        @keyframes bounce-4 { 0%,100%{transform:scaleY(0.6)} 50%{transform:scaleY(1)} }
        @keyframes bounce-5 { 0%,100%{transform:scaleY(0.45)} 50%{transform:scaleY(1)} }
      `}</style>
    </div>
  );
}