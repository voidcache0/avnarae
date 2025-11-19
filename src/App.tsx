import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Practitioners from "./pages/Practitioners";
import PractitionerProfile from "./pages/PractitionerProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ClientDashboard from "./pages/ClientDashboard";
import PractitionerDashboard from "./pages/PractitionerDashboard";
import PractitionerVerification from "./pages/PractitionerVerification";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPractitioners from "./pages/admin/AdminPractitioners";
import AdminBookings from "./pages/admin/AdminBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { role } = useAuth();

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'practitioner') return <PractitionerDashboard />;
  return <ClientDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Helmet>
        <title>Avenrae - Connect with Spiritual Practitioners</title>
        <meta
          name="description"
          content="Find trusted spiritual practitioners, traditional healers, and energy workers in South Africa. Book verified sessions for spiritual guidance, healing, and personal growth."
        />
      </Helmet>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes with header/footer */}
            <Route path="/" element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/practitioners" element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Practitioners />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/practitioners/:id" element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <PractitionerProfile />
                </main>
                <Footer />
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* User dashboards with header/footer */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    <DashboardRouter />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/practitioner/verification" element={
              <ProtectedRoute allowedRoles={['practitioner']}>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    <PractitionerVerification />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            } />

            {/* Admin routes with sidebar layout (no header/footer) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminOverview />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/verification" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminVerification />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/practitioners" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminPractitioners />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* 404 with header/footer */}
            <Route path="*" element={
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <NotFound />
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
