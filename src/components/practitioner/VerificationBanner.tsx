import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface VerificationBannerProps {
  status: 'pending' | 'verified' | 'rejected';
}

export const VerificationBanner = ({ status }: VerificationBannerProps) => {
  const navigate = useNavigate();

  if (status === 'verified') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Account Verified</AlertTitle>
        <AlertDescription className="text-green-800">
          Your practitioner account has been verified. You can now receive bookings from clients.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'rejected') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Verification Rejected</AlertTitle>
        <AlertDescription>
          Your verification was not approved. Please check your documents and resubmit.
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1 text-destructive"
            onClick={() => navigate('/practitioner/verification')}
          >
            View details
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <Clock className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-900">Verification Pending</AlertTitle>
      <AlertDescription className="text-yellow-800">
        Your account is under review. Complete your verification documents to start receiving bookings.
        <Button 
          variant="link" 
          className="p-0 h-auto ml-1 text-yellow-900"
          onClick={() => navigate('/practitioner/verification')}
        >
          Complete verification
        </Button>
      </AlertDescription>
    </Alert>
  );
};
