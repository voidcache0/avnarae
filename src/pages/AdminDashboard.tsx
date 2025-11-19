import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PractitionerWithProfile {
  id: string;
  user_id: string;
  bio: string;
  specializations: string[];
  verification_status: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [practitioners, setPractitioners] = useState<PractitionerWithProfile[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPractitioners: 0,
    pendingVerifications: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats
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

      // Fetch pending practitioners with profiles
      const { data: practData } = await supabase
        .from('practitioners')
        .select('*')
        .eq('verification_status', 'pending');

      if (practData) {
        const practWithProfiles = await Promise.all(
          practData.map(async (pract: any) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', pract.user_id)
              .single();

            // Get email from auth.users
            const { data: { user } } = await supabase.auth.admin.getUserById(pract.user_id);

            return {
              ...pract,
              profile: {
                ...profileData,
                email: user?.email || '',
              }
            };
          })
        );

        setPractitioners(practWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (practitionerId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('practitioners')
        .update({ verification_status: status })
        .eq('id', practitionerId);

      if (error) throw error;

      toast({
        title: status === 'verified' ? 'Practitioner verified' : 'Practitioner rejected',
        description: `The practitioner has been ${status}`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users, practitioners, and platform settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practitioners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPractitioners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Practitioner Verifications</CardTitle>
          <CardDescription>Review and approve practitioner applications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : practitioners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending verifications
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specializations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practitioners.map((practitioner) => (
                  <TableRow key={practitioner.id}>
                    <TableCell className="font-medium">
                      {practitioner.profile.first_name} {practitioner.profile.last_name}
                    </TableCell>
                    <TableCell>{practitioner.profile.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {practitioner.specializations.map((spec, i) => (
                          <Badge key={i} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{practitioner.verification_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerification(practitioner.id, 'verified')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerification(practitioner.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
