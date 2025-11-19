import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Heart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const ClientHomeView = () => {
  const { profile } = useAuth();
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUpcomingBooking = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          practitioners (
            user_id,
            profiles (first_name, last_name)
          )
        `)
        .eq('client_id', profile.id)
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .eq('status', 'confirmed')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      setUpcomingBooking(data);
    };

    fetchUpcomingBooking();
  }, [profile]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.first_name}!</h1>
        <p className="text-muted-foreground">Continue your spiritual journey</p>
      </div>

      {/* Quick Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for services or practitioners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  window.location.href = `/practitioners?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            />
          </div>
          <Button className="w-full mt-4" asChild>
            <Link to={`/practitioners${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}>
              Find Practitioners
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Upcoming Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBooking ? (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">
                    {upcomingBooking.practitioners?.profiles?.first_name}{" "}
                    {upcomingBooking.practitioners?.profiles?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(upcomingBooking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {upcomingBooking.start_time} - {upcomingBooking.end_time}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/dashboard">View Details</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/practitioners">Book a Session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/practitioners">
                <Search className="mr-2 h-4 w-4" />
                Browse Practitioners
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard">
                <Heart className="mr-2 h-4 w-4" />
                My Favorites
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Practitioners */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your interests and previous bookings
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link to="/practitioners">Explore Practitioners</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
