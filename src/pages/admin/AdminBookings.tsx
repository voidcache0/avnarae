import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function AdminBookings() {
  return (
    <>
      <Helmet>
        <title>Manage Bookings - Admin</title>
        <meta name="description" content="View and manage all platform bookings" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all bookings on the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Bookings management coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                This feature will allow you to view, cancel, and resolve booking disputes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
