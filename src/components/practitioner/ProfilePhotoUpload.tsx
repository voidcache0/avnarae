import { useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  practitionerId: string;
  currentPhotoUrl?: string | null;
  userName: string;
  onUploadComplete?: () => void;
}

export const ProfilePhotoUpload = ({ 
  practitionerId, 
  currentPhotoUrl, 
  userName,
  onUploadComplete 
}: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload JPEG, PNG, or WEBP images only.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload images smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('practitioner-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('practitioner-media')
        .getPublicUrl(filePath);

      // Update practitioner profile with photo URL
      const updateField = type === 'profile' ? 'cover_photo_url' : 'cover_photo_url';
      const { error: updateError } = await supabase
        .from('practitioners')
        .update({ [updateField]: publicUrl })
        .eq('id', practitionerId);

      if (updateError) throw updateError;

      // Also save to media table
      await supabase.from('practitioner_media').insert({
        practitioner_id: practitionerId,
        file_name: file.name,
        file_path: filePath,
        media_type: type,
      });

      toast({
        title: 'Photo uploaded',
        description: `Your ${type} photo has been updated.`,
      });

      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Profile Photo</h3>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentPhotoUrl || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                id="profile-photo-upload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, 'profile');
                }}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('profile-photo-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WEBP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Cover Photo</h3>
          <div className="space-y-4">
            {currentPhotoUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img
                  src={currentPhotoUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 rounded-lg bg-gradient-spiritual flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">No cover photo yet</p>
                </div>
              </div>
            )}
            <input
              type="file"
              id="cover-photo-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, 'cover');
              }}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('cover-photo-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Cover Photo
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x400px. JPG, PNG or WEBP. Max 5MB.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
