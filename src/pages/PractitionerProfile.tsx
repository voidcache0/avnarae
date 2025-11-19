import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Award,
  ChevronLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const PractitionerProfile = () => {
  const { id } = useParams();
  const [practitioner, setPractitioner] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [practitionerData, setPractitionerData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPractitioner();
  }, [id]);

  const fetchPractitioner = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('practitioners')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url)
        `)
        .eq('id', id)
        .eq('verification_status', 'verified')
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Practitioner not found',
          description: 'This practitioner may not be verified yet.',
          variant: 'destructive',
        });
        return;
      }

      setPractitionerData(data);
      setPractitioner(data);

      // Fetch media
      const { data: mediaData } = await supabase
        .from('practitioner_media')
        .select('*')
        .eq('practitioner_id', id)
        .order('display_order', { ascending: true });

      if (mediaData) setMedia(mediaData);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load practitioner profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('practitioner-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Practitioner Not Found</h2>
          <p className="text-muted-foreground mb-4">This practitioner may not be verified yet.</p>
          <Button asChild>
            <Link to="/practitioners">Browse Practitioners</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{practitioner.profiles?.first_name} {practitioner.profiles?.last_name} - Avenrae</title>
        <meta name="description" content={practitioner.bio || 'Verified spiritual practitioner on Avenrae'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Back Navigation */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" asChild>
              <Link to="/practitioners">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Practitioners
              </Link>
            </Button>
          </div>
        </div>

        {/* Cover Photo */}
        {practitioner.cover_photo_url && (
          <div className="w-full h-64 bg-muted">
            <img
              src={practitioner.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Profile Header */}
        <section className="border-b bg-gradient-hero py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-start gap-6">
                  <Avatar className="h-24 w-24 flex-shrink-0">
                    <AvatarImage src={practitioner.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {getInitials(practitioner.profiles?.first_name, practitioner.profiles?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h1 className="text-3xl font-bold">
                        {practitioner.profiles?.first_name} {practitioner.profiles?.last_name}
                      </h1>
                      {practitioner.verification_status === 'verified' && (
                        <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="mb-3 text-lg text-muted-foreground">
                      {practitioner.tags?.[0] || 'Spiritual Practitioner'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">New</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{practitioner.location_name || practitioner.address || 'Location not specified'}</span>
                      </div>
                      {practitioner.years_of_experience && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{practitioner.years_of_experience} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-baseline justify-between">
                        <span className="text-3xl font-bold">
                          R{practitioner.hourly_rate || 0}
                        </span>
                        <span className="text-muted-foreground">/hour</span>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        disabled={practitioner.verification_status !== 'verified'}
                      >
                        {practitioner.verification_status === 'verified' 
                          ? 'Book Session' 
                          : 'Not Available'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="mb-2 text-2xl font-bold">
                        {practitioner.services?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Services</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                {practitioner.bio && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">About</h2>
                      <p className="leading-relaxed text-muted-foreground">
                        {practitioner.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {practitioner.services && practitioner.services.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Services</h2>
                      <ul className="space-y-2">
                        {practitioner.services.map((service: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {practitioner.tags && practitioner.tags.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Specialties</h2>
                      <div className="flex flex-wrap gap-2">
                        {practitioner.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {practitioner.qualifications && practitioner.qualifications.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Qualifications</h2>
                      <ul className="space-y-2">
                        {practitioner.qualifications.map((qual: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-xl font-semibold">Details</h2>
                    <div className="space-y-3">
                      {(practitioner.location_name || practitioner.address) && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-sm text-muted-foreground">
                              {practitioner.location_name || practitioner.address}
                            </div>
                          </div>
                        </div>
                      )}
                      {practitioner.languages && practitioner.languages.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Clock className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Languages</div>
                            <div className="text-sm text-muted-foreground">
                              {practitioner.languages.join(", ")}
                            </div>
                          </div>
                        </div>
                      )}
                      {practitioner.is_available && (
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Availability</div>
                            <div className="text-sm text-muted-foreground">
                              Currently accepting bookings
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {media.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-semibold">Gallery</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {media.map((item) => (
                          <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={getPublicUrl(item.file_path)}
                              alt={item.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No reviews yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
};

export default PractitionerProfile;
