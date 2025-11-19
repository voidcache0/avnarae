import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AdminVerification() {
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingPractitioners();
  }, []);

  const fetchPendingPractitioners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('practitioners')
        .select(`
          *,
          profiles:user_id (first_name, last_name, phone)
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPractitioners(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending verifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (practitionerId: string) => {
    const { data } = await supabase
      .from('practitioner_documents')
      .select('*')
      .eq('practitioner_id', practitionerId);

    setDocuments(data || []);
  };

  const handleVerificationAction = async (practitionerId: string, action: 'verified' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification status
      const { error: updateError } = await supabase
        .from('practitioners')
        .update({ verification_status: action })
        .eq('id', practitionerId);

      if (updateError) throw updateError;

      // Add verification note
      if (note.trim()) {
        const { error: noteError } = await supabase
          .from('verification_notes')
          .insert({
            practitioner_id: practitionerId,
            admin_id: user.id,
            note: note.trim(),
            action,
          });

        if (noteError) throw noteError;
      }

      toast({
        title: 'Success',
        description: `Practitioner ${action === 'verified' ? 'approved' : 'rejected'}`,
      });

      setNote('');
      setSelectedPractitioner(null);
      fetchPendingPractitioners();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const viewDocument = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('practitioner-documents')
      .createSignedUrl(filePath, 3600);

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
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
        <title>Verification Queue - Admin</title>
        <meta name="description" content="Review and approve practitioner verification applications" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification Queue</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve practitioner applications
          </p>
        </div>

        {practitioners.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-medium">No pending verifications</p>
              <p className="text-sm text-muted-foreground mt-2">
                All practitioner applications have been reviewed
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {practitioners.map((practitioner) => (
              <Card key={practitioner.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {practitioner.profiles?.first_name} {practitioner.profiles?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(practitioner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone:</span> {practitioner.profiles?.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Experience:</span> {practitioner.years_of_experience} years
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span> R{practitioner.hourly_rate}/hr
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span> {practitioner.location_name || 'N/A'}
                    </div>
                  </div>

                  {practitioner.bio && (
                    <div>
                      <p className="text-sm font-medium mb-1">Bio:</p>
                      <p className="text-sm text-muted-foreground">{practitioner.bio}</p>
                    </div>
                  )}

                  {selectedPractitioner === practitioner.id && (
                    <div className="space-y-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchDocuments(practitioner.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents ({documents.length})
                      </Button>

                      {documents.length > 0 && (
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="text-sm font-medium">{doc.document_type.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewDocument(doc.file_path)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <Textarea
                        placeholder="Add a note (optional)..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                      />

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          onClick={() => handleVerificationAction(practitioner.id, 'verified')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleVerificationAction(practitioner.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPractitioner(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedPractitioner !== practitioner.id && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPractitioner(practitioner.id)}
                    >
                      Review Application
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
