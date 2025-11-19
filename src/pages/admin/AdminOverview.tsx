import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPractitioners: 0,
    pendingVerifications: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: practitionerCount } = await supabase
        .from('practitioners')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('practitioners')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: userCount || 0,
        totalPractitioners: practitionerCount || 0,
        pendingVerifications: pendingCount || 0,
        totalBookings: bookingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      link: "/admin/users",
      color: "text-blue-600",
    },
    {
      title: "Total Practitioners",
      value: stats.totalPractitioners,
      icon: UserCheck,
      link: "/admin/practitioners",
      color: "text-green-600",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: AlertCircle,
      link: "/admin/verification",
      color: "text-yellow-600",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      link: "/admin/bookings",
      color: "text-purple-600",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Avenrae</title>
        <meta name="description" content="Admin dashboard overview and statistics" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of platform activity and pending tasks
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-4 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Link key={card.title} to={card.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {stats.pendingVerifications > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                You have {stats.pendingVerifications} practitioner{stats.pendingVerifications !== 1 ? 's' : ''} waiting for verification.
              </p>
              <Link to="/admin/verification">
                <Button variant="default">
                  Review Verifications
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
