// Minimal Web Speech API typings to satisfy TypeScript in browsers that support it

export {};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart?: () => void;
    onend?: () => void;
    onerror?: (event: any) => void;
    onresult?: (event: SpeechRecognitionEvent) => void;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
}


