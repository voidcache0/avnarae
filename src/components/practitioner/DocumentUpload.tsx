import { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  practitionerId: string;
  onUploadComplete?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'qualification', label: 'Proof of Qualification', required: true },
  { value: 'government_id', label: 'Government-Issued ID', required: true },
  { value: 'business_license', label: 'Business/Practice License', required: false },
  { value: 'insurance', label: 'Professional Insurance', required: false },
  { value: 'background_check', label: 'Background Check', required: false },
  { value: 'recommendation', label: 'Letters of Recommendation', required: false },
  { value: 'portfolio', label: 'Portfolio Samples', required: false },
];

export const DocumentUpload = ({ practitionerId, onUploadComplete }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF, JPEG, or PNG files only.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload files smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(documentType);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('practitioner-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { error: dbError } = await supabase
        .from('practitioner_documents')
        .insert({
          practitioner_id: practitionerId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        });

      if (dbError) throw dbError;

      setUploadedDocs((prev) => ({
        ...prev,
        [documentType]: { name: file.name, uploaded: true },
      }));

      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded successfully.',
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
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Verification Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload the required documents to verify your practitioner account. All documents are reviewed by our admin team.
        </p>
      </div>

      <div className="grid gap-4">
        {DOCUMENT_TYPES.map((docType) => (
          <Card key={docType.value} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-medium">
                  {docType.label}
                  {docType.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {docType.required ? 'Required for verification' : 'Optional but recommended'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {uploadedDocs[docType.value] ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Uploaded</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id={`upload-${docType.value}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, docType.value);
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`upload-${docType.value}`)?.click()}
                      disabled={uploading === docType.value}
                    >
                      {uploading === docType.value ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
