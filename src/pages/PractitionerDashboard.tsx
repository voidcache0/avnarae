import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VerificationBanner } from "@/components/practitioner/VerificationBanner";
import { ProfileCompleteness } from "@/components/practitioner/ProfileCompleteness";
import { ProfileEditor } from "@/components/practitioner/ProfileEditor";
import { ProfilePhotoUpload } from '@/components/practitioner/ProfilePhotoUpload';
import { MediaGallery } from '@/components/practitioner/MediaGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  amount: number;
  notes: string;
  client_profile: {
    first_name: string;
    last_name: string;
  };
}

const PractitionerDashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [practitionerData, setPractitionerData] = useState<any>(null);

  useEffect(() => {
    fetchPractitionerData();
  }, [user]);

  const fetchPractitionerData = async () => {
    if (!user) return;

    try {
      // Get practitioner ID and profile data
      const { data: practData, error: practError } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (practError) throw practError;
      setPractitionerId(practData.id);
      setVerificationStatus(practData.verification_status);
      setPractitionerData(practData);

      // Calculate profile completeness
      const fields = [
        practData.bio,
        practData.hourly_rate,
        practData.years_of_experience,
        practData.location_name,
        practData.specializations?.length > 0,
        practData.services?.length > 0,
        practData.qualifications?.length > 0,
      ];
      const filledFields = fields.filter(Boolean).length;
      const completeness = Math.round((filledFields / fields.length) * 100);
      setProfileCompleteness(completeness);

      const missing = [];
      if (!practData.bio) missing.push('Bio');
      if (!practData.hourly_rate) missing.push('Hourly Rate');
      if (!practData.years_of_experience) missing.push('Years of Experience');
      if (!practData.location_name) missing.push('Location');
      if (!practData.specializations?.length) missing.push('Specializations');
      if (!practData.services?.length) missing.push('Services');
      if (!practData.qualifications?.length) missing.push('Qualifications');
      setMissingFields(missing);

      // Fetch bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('practitioner_id', practData.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;

      // Fetch client profiles
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', booking.client_id)
            .single();

          return {
            ...booking,
            client_profile: profileData || { first_name: '', last_name: '' }
          };
        })
      );

      setBookings(bookingsWithProfiles);
    } catch (error) {
      console.error('Error fetching practitioner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'cancelled' | 'completed' | 'confirmed' | 'pending') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking updated",
        description: `Booking status changed to ${newStatus}`,
      });

      fetchPractitionerData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.booking_date) >= new Date()
  );
  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {profile?.first_name}!</h1>
        <p className="text-muted-foreground mt-2">Manage your sessions and availability</p>
      </div>

      <div className="mb-6">
        <VerificationBanner status={verificationStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          {practitionerId && (
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="media">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <ProfileEditor practitionerId={practitionerId} />
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <ProfilePhotoUpload
                  practitionerId={practitionerId}
                  currentPhotoUrl={practitionerData?.cover_photo_url}
                  userName={`${profile?.first_name || ''} ${profile?.last_name || ''}`}
                  onUploadComplete={fetchPractitionerData}
                />
                <MediaGallery practitionerId={practitionerId} />
              </TabsContent>
            </Tabs>
          )}
        </div>
        <div>
          <ProfileCompleteness 
            completeness={profileCompleteness}
            missingFields={missingFields}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{pendingBookings.length}</CardTitle>
            <CardDescription>Pending Bookings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{confirmedBookings.length}</CardTitle>
            <CardDescription>Upcoming Sessions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">{bookings.length}</CardTitle>
            <CardDescription>Total Bookings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">R{totalEarnings.toFixed(0)}</CardTitle>
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Booking Requests</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : pendingBookings.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No pending bookings</h3>
            <p className="text-muted-foreground">New booking requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {booking.client_profile.first_name} {booking.client_profile.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Upcoming Confirmed Sessions</h2>
      </div>

      {confirmedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No upcoming sessions</h3>
            <p className="text-muted-foreground">Confirmed sessions will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {confirmedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {booking.client_profile.first_name} {booking.client_profile.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {booking.amount && (
                      <p className="text-lg font-semibold">R{booking.amount}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PractitionerDashboard;
