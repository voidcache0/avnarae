import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, ShieldCheck, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const AdminHomeView = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    newSignups: 0,
    todayBookings: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Pending verifications
      const { count: pendingCount } = await supabase
        .from('practitioners')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      // New signups today
      const today = new Date().toISOString().split('T')[0];
      const { count: signupCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Today's bookings
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_date', today);

      // Total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        pendingVerifications: pendingCount || 0,
        newSignups: signupCount || 0,
        todayBookings: bookingCount || 0,
        totalUsers: userCount || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.first_name}! Here's your platform overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Require your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSignups}</div>
            <p className="text-xs text-muted-foreground">New users registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/admin/verification">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verification Queue
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              User Directory
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/admin/practitioners">
              <UserCheck className="mr-2 h-4 w-4" />
              Practitioner Directory
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/admin/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              Bookings Overview
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Priority Items */}
      {stats.pendingVerifications > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    {stats.pendingVerifications} practitioner{stats.pendingVerifications !== 1 ? 's' : ''} waiting for verification
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Review and approve pending applications
                  </p>
                </div>
                <Button variant="default" asChild>
                  <Link to="/admin/verification">Review Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
