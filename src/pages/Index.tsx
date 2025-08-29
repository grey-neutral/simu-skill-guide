export default function Index() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl mx-auto p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Your Interview Simulator
          </h1>
          <p className="text-xl text-muted-foreground">
            Master your interview skills with AI-powered practice sessions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Upload Your CV</h3>
            <p className="text-sm text-muted-foreground">Start by uploading your resume to personalize your practice sessions</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Create Profiles</h3>
            <p className="text-sm text-muted-foreground">Set up profiles for different companies and positions you're targeting</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Practice & Improve</h3>
            <p className="text-sm text-muted-foreground">Get instant feedback and track your progress over time</p>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <p className="text-muted-foreground text-center">
            👈 Get started by uploading your CV and creating your first profile in the sidebar
          </p>
        </div>
      </div>
    </div>
  );
}