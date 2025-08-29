import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Upload, Users, TrendingUp, Plus, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  createdAt: Date;
}

export function AppSidebar() {
  const location = useLocation();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([
    { id: "1", name: "Google Software Engineer", createdAt: new Date("2024-01-15") },
    { id: "2", name: "Morgan Stanley Analyst", createdAt: new Date("2024-01-20") },
  ]);
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      createdAt: new Date(),
    };
    
    setProfiles([...profiles, newProfile]);
    setNewProfileName("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Profile Created",
      description: `"${newProfile.name}" has been added to your profiles.`,
    });
  };

  const handleRenameProfile = (id: string) => {
    if (!editName.trim()) return;
    
    setProfiles(profiles.map(p => 
      p.id === id ? { ...p, name: editName.trim() } : p
    ));
    setEditingProfile(null);
    setEditName("");
    
    toast({
      title: "Profile Renamed",
      description: "Profile name has been updated.",
    });
  };

  const handleDeleteProfile = (id: string) => {
    const profileName = profiles.find(p => p.id === id)?.name;
    setProfiles(profiles.filter(p => p.id !== id));
    
    toast({
      title: "Profile Deleted",
      description: `"${profileName}" has been removed.`,
      variant: "destructive",
    });
  };

  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvUploaded(true);
      toast({
        title: "CV Uploaded",
        description: `"${file.name}" has been uploaded successfully.`,
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-80 bg-card border-r border-border h-screen flex flex-col shadow-professional">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Interview Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-Powered Practice Sessions</p>
      </div>

      {/* My CV Section */}
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          My CV
        </h2>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCvUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="cv-upload"
          />
          <Button
            variant={cvUploaded ? "secondary" : "outline"}
            className="w-full justify-start"
            asChild
          >
            <label htmlFor="cv-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {cvUploaded ? "CV Uploaded ✓" : "Upload CV"}
            </label>
          </Button>
        </div>
        {cvUploaded && (
          <p className="text-xs text-muted-foreground mt-2">
            PDF uploaded • Ready for interviews
          </p>
        )}
      </div>

      {/* Profiles Section */}
      <div className="p-6 border-b border-border flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profiles
          </h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="e.g., Amazon Product Manager"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddProfile} disabled={!newProfileName.trim()}>
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

        <div className="space-y-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="group relative">
              {editingProfile === profile.id ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameProfile(profile.id);
                      if (e.key === "Escape") setEditingProfile(null);
                    }}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleRenameProfile(profile.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <NavLink
                    to={`/profile/${profile.id}`}
                    className={({ isActive }) =>
                      `flex-1 block px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`
                    }
                  >
                    {profile.name}
                  </NavLink>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingProfile(profile.id);
                          setEditName(profile.name);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-2" />
                        Rename
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
              )}
            </div>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No profiles yet</p>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              Create Your First Profile
            </Button>
          </div>
        )}
      </div>

      {/* Progression Section */}
      <div className="p-6">
        <NavLink
          to="/progression"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`
          }
        >
          <TrendingUp className="h-4 w-4" />
          Progression
        </NavLink>
      </div>
    </div>
  );
}