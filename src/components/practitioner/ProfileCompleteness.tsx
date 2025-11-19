import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

interface ProfileCompletenessProps {
  completeness: number;
  missingFields: string[];
}

export const ProfileCompleteness = ({ completeness, missingFields }: ProfileCompletenessProps) => {
  const getCompletenessColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile Completeness</h3>
          <span className={`text-2xl font-bold ${getCompletenessColor(completeness)}`}>
            {completeness}%
          </span>
        </div>

        <Progress value={completeness} className="h-2" />

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Complete your profile to attract more clients:</p>
            <ul className="space-y-2">
              {missingFields.map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm">
                  <Circle className="h-3 w-3 text-muted-foreground" />
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {completeness === 100 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Your profile is complete!</span>
          </div>
        )}
      </div>
    </Card>
  );
};
