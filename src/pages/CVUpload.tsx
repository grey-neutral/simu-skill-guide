import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, ArrowRight, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CVUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
      toast({
        title: "CV Uploaded Successfully!",
        description: `"${file.name}" has been uploaded and is ready for use.`,
      });
    }, 1500);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">Upload Your CV</h1>
          <p className="text-muted-foreground">
            Upload your resume to personalize your interview practice sessions
          </p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    {isUploading ? "Uploading..." : "Choose a file to upload"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, DOC, or DOCX files are supported
                  </p>
                  
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                    disabled={isUploading}
                  />
                  
                  <Button asChild disabled={isUploading}>
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Select File"}
                    </label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">
                      CV Uploaded Successfully!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your CV will be used to personalize interview questions and provide relevant feedback.
                  </p>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/job-profiles')}  
                      className="flex-1"
                    >
                      Continue to Job Profiles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedFile(null);
                        // Reset file input
                        const input = document.getElementById('cv-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      Upload Different File
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted">
          <CardContent className="p-6">
            <h3 className="font-medium text-foreground mb-3">Why upload your CV?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Get personalized interview questions based on your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Receive targeted feedback on your responses</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>Practice explaining your background and achievements</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}