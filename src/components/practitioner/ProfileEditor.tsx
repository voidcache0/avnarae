import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload } from 'lucide-react';

interface ProfileEditorProps {
  practitionerId: string;
}

export const ProfileEditor = ({ practitionerId }: ProfileEditorProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [practitionerId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('id', practitionerId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('practitioners')
        .update({
          bio: profile.bio,
          services: profile.services,
          qualifications: profile.qualifications,
          hourly_rate: profile.hourly_rate,
          years_of_experience: profile.years_of_experience,
          address: profile.address,
          languages: profile.languages,
          tags: profile.tags,
        })
        .eq('id', practitionerId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">About</h3>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile?.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell clients about yourself, your journey, and your approach..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Location</Label>
            <Input
              id="address"
              value={profile?.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="City, Region, Country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={profile?.years_of_experience || ''}
                onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) })}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (R)</Label>
              <Input
                id="rate"
                type="number"
                value={profile?.hourly_rate || ''}
                onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) })}
                placeholder="500"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Services & Specialties</h3>
          
          <div className="space-y-2">
            <Label htmlFor="services">Services Offered</Label>
            <Textarea
              id="services"
              value={profile?.services?.join('\n') || ''}
              onChange={(e) => setProfile({ ...profile, services: e.target.value.split('\n').filter(s => s.trim()) })}
              placeholder="Enter each service on a new line..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">One service per line</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Specialties/Tags</Label>
            <Input
              id="tags"
              value={profile?.tags?.join(', ') || ''}
              onChange={(e) => setProfile({ ...profile, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
              placeholder="sangoma, tarot, medium, healing"
            />
            <p className="text-xs text-muted-foreground">Comma-separated tags</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Qualifications</h3>
          
          <div className="space-y-2">
            <Label htmlFor="qualifications">Certifications & Training</Label>
            <Textarea
              id="qualifications"
              value={profile?.qualifications?.join('\n') || ''}
              onChange={(e) => setProfile({ ...profile, qualifications: e.target.value.split('\n').filter(q => q.trim()) })}
              placeholder="Enter each qualification on a new line..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">One qualification per line</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages</Label>
            <Input
              id="languages"
              value={profile?.languages?.join(', ') || ''}
              onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(',').map(l => l.trim()).filter(l => l) })}
              placeholder="English, Zulu, Xhosa"
            />
            <p className="text-xs text-muted-foreground">Comma-separated languages</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
