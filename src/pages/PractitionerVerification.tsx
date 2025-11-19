import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUpload } from '@/components/practitioner/DocumentUpload';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PractitionerVerification() {
  const { user } = useAuth();
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchPractitionerData();
  }, [user]);

  const fetchPractitionerData = async () => {
    if (!user) return;

    try {
      const { data: practitioner, error } = await supabase
        .from('practitioners')
        .select('id, verification_status')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No practitioner record exists, create one
        const { data: newPractitioner, error: insertError } = await supabase
          .from('practitioners')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error creating practitioner:', insertError);
          return;
        }

        if (newPractitioner) {
          setPractitionerId(newPractitioner.id);
        }
      } else if (practitioner) {
        setPractitionerId(practitioner.id);
        fetchDocuments(practitioner.id);
      }
    } catch (error) {
      console.error('Error fetching practitioner:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (id: string) => {
    const { data } = await supabase
      .from('practitioner_documents')
      .select('*')
      .eq('practitioner_id', id)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Practitioner Verification - Avenrae</title>
        <meta name="description" content="Complete your practitioner verification to start receiving bookings" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Practitioner Verification</h1>
            <p className="text-muted-foreground mt-2">
              Upload the required documents to verify your account and start receiving bookings from clients.
            </p>
          </div>

          {practitionerId && (
            <DocumentUpload
              practitionerId={practitionerId}
              onUploadComplete={() => fetchDocuments(practitionerId)}
            />
          )}

          {documents.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.document_type.replace('_', ' ')} • {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      {doc.is_verified ? (
                        <span className="text-green-600 font-medium">Verified</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Under Review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
