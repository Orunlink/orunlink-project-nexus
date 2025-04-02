
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from "@/components/ui/input-otp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  // Sanitize input to prevent XSS attacks
  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>&"']/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return match;
      }
    });
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate and sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim());

    if (!sanitizedEmail) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Mock API call to send reset link
    // In a real app, this would call your backend API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions.",
      });
      // Move to OTP step
      setStep("otp");
    }, 1500);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid verification code");
      setIsLoading(false);
      return;
    }

    // Mock OTP verification
    // In a real app, this would verify the OTP with your backend
    setTimeout(() => {
      setIsLoading(false);
      // Move to password reset step
      setStep("newPassword");
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Mock password reset
    // In a real app, this would reset the password in your backend
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Password reset successfully",
        description: "You can now sign in with your new password.",
      });
      // Redirect to login
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo */}
      <header className="p-4 bg-white">
        <div className="max-w-md mx-auto">
          <Link to="/" className="text-2xl font-bold text-orunlink-purple">
            Orunlink
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {step === "email" && (
              <>
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-gray-500 mt-2">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </>
            )}
            {step === "otp" && (
              <>
                <h1 className="text-2xl font-bold">Verification code</h1>
                <p className="text-gray-500 mt-2">
                  Enter the 6-digit code sent to your email
                </p>
              </>
            )}
            {step === "newPassword" && (
              <>
                <h1 className="text-2xl font-bold">Create new password</h1>
                <p className="text-gray-500 mt-2">
                  Enter and confirm your new password
                </p>
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <form onSubmit={handleSendResetLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orunlink-purple hover:bg-orunlink-dark"
                disabled={isLoading}
              >
                {isLoading ? "Sending link..." : "Send reset link"}
              </Button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-orunlink-purple hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <React.Fragment key={index}>
                          <InputOTPSlot index={index} className="h-12 w-12 text-lg" />
                          {index !== slots.length - 1 && <InputOTPSeparator />}
                        </React.Fragment>
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orunlink-purple hover:bg-orunlink-dark"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify code"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: "Code resent",
                        description: "A new verification code has been sent to your email.",
                      });
                    }}
                    className="text-orunlink-purple hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </form>
          )}

          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a new password"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orunlink-purple hover:bg-orunlink-dark"
                disabled={isLoading}
              >
                {isLoading ? "Resetting password..." : "Reset password"}
              </Button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Orunlink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
