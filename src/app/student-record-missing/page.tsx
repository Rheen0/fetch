import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentRecordMissing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Student Record Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            Your student record could not be found. This might happen if:
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Your onboarding process was not completed</li>
              <li>Your account email doesn't match your student record</li>
              <li>There was an error during account creation</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 space-y-3">
          <Link href="/onboarding" className="block">
            <Button className="w-full">
              Complete Onboarding
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/profile/support" className="block">
            <Button variant="ghost" className="w-full">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
