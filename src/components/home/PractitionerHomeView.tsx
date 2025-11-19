import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Settings, Upload, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VerificationBanner } from "@/components/practitioner/VerificationBanner";
import { ProfileCompleteness } from "@/components/practitioner/ProfileCompleteness";

export const PractitionerHomeView = () => {
  const { profile } = useAuth();
  const [practitionerData, setPractitionerData] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchPractitionerData = async () => {
      if (!profile?.id) return;

      // Fetch practitioner profile
      const { data: practitioner } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      setPractitionerData(practitioner);

      if (practitioner) {
        // Calculate profile completeness
        const fields = [
          { key: 'bio', label: 'Bio' },
          { key: 'hourly_rate', label: 'Hourly Rate' },
          { key: 'years_of_experience', label: 'Years of Experience' },
          { key: 'specializations', label: 'Specializations' },
          { key: 'qualifications', label: 'Qualifications' },
          { key: 'services', label: 'Services' },
          { key: 'location_name', label: 'Location' },
        ];

        const missing = fields.filter(field => {
          const value = practitioner[field.key];
          return !value || (Array.isArray(value) && value.length === 0);
        }).map(field => field.label);

        setMissingFields(missing);
        setCompleteness(Math.round(((fields.length - missing.length) / fields.length) * 100));

        // Fetch upcoming bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles!bookings_client_id_fkey (first_name, last_name)
          `)
          .eq('practitioner_id', practitioner.id)
          .gte('booking_date', new Date().toISOString().split('T')[0])
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(3);

        setUpcomingBookings(bookings || []);
      }
    };

    fetchPractitionerData();
  }, [profile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.first_name}!</h1>
        <p className="text-muted-foreground">Manage your practice and bookings</p>
      </div>

      {/* Verification Status */}
      {practitionerData && (
        <div className="mb-6">
          <VerificationBanner status={practitionerData.verification_status} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Profile Completeness */}
        <div className="lg:col-span-2">
          <ProfileCompleteness completeness={completeness} missingFields={missingFields} />
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-sm font-semibold ${practitionerData?.is_available ? 'text-green-600' : 'text-gray-600'}`}>
                {practitionerData?.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Upcoming</span>
              <span className="text-sm font-semibold">{upcomingBookings.length} bookings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-semibold">
                      {booking.profiles?.first_name} {booking.profiles?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dashboard">View All Bookings</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming bookings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/dashboard">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/dashboard">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Availability
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/dashboard">
              <FileText className="mr-2 h-4 w-4" />
              View Full Calendar
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/practitioner/verification">
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
