import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface PractitionerData {
  id: string;
  user_id: string;
  bio: string | null;
  specializations: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminPractitioners() {
  const [practitioners, setPractitioners] = useState<PractitionerData[]>([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState<PractitionerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPractitioners();
  }, []);

  useEffect(() => {
    let filtered = practitioners;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.verification_status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        `${p.profile.first_name} ${p.profile.last_name} ${p.profile.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPractitioners(filtered);
  }, [searchQuery, statusFilter, practitioners]);

  const fetchPractitioners = async () => {
    try {
      const { data: practData } = await supabase
        .from('practitioners')
        .select('*')
        .order('created_at', { ascending: false });

      if (!practData) return;

      const practWithProfiles = await Promise.all(
        practData.map(async (pract) => {
          const [{ data: profileData }, { data: { user } }] = await Promise.all([
            supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', pract.user_id)
              .single(),
            supabase.auth.admin.getUserById(pract.user_id)
          ]);

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
      setFilteredPractitioners(practWithProfiles);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      toast({
        title: "Error",
        description: "Failed to load practitioners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: practitioners.length,
    verified: practitioners.filter(p => p.verification_status === 'verified').length,
    pending: practitioners.filter(p => p.verification_status === 'pending').length,
    rejected: practitioners.filter(p => p.verification_status === 'rejected').length,
  };

  return (
    <>
      <Helmet>
        <title>Manage Practitioners - Admin</title>
        <meta name="description" content="View and manage all practitioners" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Practitioners</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all practitioners on the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Practitioners ({filteredPractitioners.length})</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'verified' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('verified')}
                >
                  Verified
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading practitioners...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPractitioners.map((practitioner) => (
                    <TableRow key={practitioner.id}>
                      <TableCell className="font-medium">
                        {practitioner.profile.first_name} {practitioner.profile.last_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {practitioner.profile.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {practitioner.specializations?.slice(0, 2).map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {practitioner.specializations?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{practitioner.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(practitioner.verification_status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(practitioner.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/practitioner/${practitioner.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
