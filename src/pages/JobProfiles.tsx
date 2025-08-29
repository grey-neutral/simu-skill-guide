import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MoreHorizontal, Pencil, Trash2, Building, Calendar, Home, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  company: string;
  createdAt: Date;
  interviewCount: number;
}

export default function JobProfiles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([
    { 
      id: "1", 
      name: "Software Engineer", 
      company: "Google",
      createdAt: new Date("2024-01-15"),
      interviewCount: 3
    },
    { 
      id: "2", 
      name: "Financial Analyst", 
      company: "Morgan Stanley",
      createdAt: new Date("2024-01-20"),
      interviewCount: 1
    },
  ]);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileCompany, setNewProfileCompany] = useState("");
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddProfile = () => {
    if (!newProfileName.trim() || !newProfileCompany.trim()) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      company: newProfileCompany.trim(),
      createdAt: new Date(),
      interviewCount: 0,
    };
    
    setProfiles([...profiles, newProfile]);
    setNewProfileName("");
    setNewProfileCompany("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Profile Created",
      description: `"${newProfile.name} at ${newProfile.company}" has been added.`,
    });
  };

  const handleRenameProfile = (id: string) => {
    if (!editName.trim() || !editCompany.trim()) return;
    
    setProfiles(profiles.map(p => 
      p.id === id ? { ...p, name: editName.trim(), company: editCompany.trim() } : p
    ));
    setEditingProfile(null);
    setEditName("");
    setEditCompany("");
    
    toast({
      title: "Profile Updated",
      description: "Profile has been successfully updated.",
    });
  };

  const handleDeleteProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    
    setProfiles(profiles.filter(p => p.id !== id));
    
    toast({
      title: "Profile Deleted",
      description: `"${profile.name} at ${profile.company}" has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex-1 p-8 bg-background">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="h-8 w-8" />
                Job Profiles
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your job applications and practice interviews for each role
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Job Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      placeholder="e.g., Google"
                      value={newProfileCompany}
                      onChange={(e) => setNewProfileCompany(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleAddProfile} 
                      disabled={!newProfileName.trim() || !newProfileCompany.trim()}
                      className="flex-1"
                    >
                      Create Profile
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Profiles Grid */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                {editingProfile === profile.id ? (
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Position</label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company</label>
                        <Input
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameProfile(profile.id);
                            if (e.key === "Escape") setEditingProfile(null);
                          }}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRenameProfile(profile.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingProfile(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building className="h-3 w-3" />
                            {profile.company}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingProfile(profile.id);
                                setEditName(profile.name);
                                setEditCompany(profile.company);
                              }}
                            >
                              <Pencil className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {profile.createdAt.toLocaleDateString()}
                          </span>
                          <Badge variant="outline">
                            {profile.interviewCount} interviews
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => navigate(`/profile/${profile.id}`)}
                          className="w-full"
                        >
                          Start Interview Setup
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Job Profiles Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first job profile to start practicing interviews
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}