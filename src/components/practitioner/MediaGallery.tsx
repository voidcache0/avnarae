import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaGalleryProps {
  practitionerId: string;
}

export const MediaGallery = ({ practitionerId }: MediaGalleryProps) => {
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, [practitionerId]);

  const fetchMedia = async () => {
    const { data } = await supabase
      .from('practitioner_media')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .order('display_order', { ascending: true });

    if (data) setMedia(data);
  };

  const handleUpload = async (file: File) => {
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
      const fileName = `gallery-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('practitioner-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('practitioner_media')
        .insert({
          practitioner_id: practitionerId,
          file_name: file.name,
          file_path: filePath,
          media_type: 'gallery',
          display_order: media.length,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Image uploaded',
        description: 'Your image has been added to the gallery.',
      });

      fetchMedia();
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

  const handleDelete = async (mediaId: string, filePath: string) => {
    try {
      await supabase.storage.from('practitioner-media').remove([filePath]);
      await supabase.from('practitioner_media').delete().eq('id', mediaId);

      toast({
        title: 'Image removed',
        description: 'The image has been deleted from your gallery.',
      });

      fetchMedia();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('practitioner-media').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Photo Gallery</h3>
        <p className="text-sm text-muted-foreground">
          Add photos of your workspace, healing space, or practice environment
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={getPublicUrl(item.file_path)}
                alt={item.file_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(item.id, item.file_path)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors">
            <input
              type="file"
              id="gallery-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="hidden"
            />
            <Button
              variant="ghost"
              className="w-full h-full"
              onClick={() => document.getElementById('gallery-upload')?.click()}
              disabled={uploading}
            >
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Add Photo</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
