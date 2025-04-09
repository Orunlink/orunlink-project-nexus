
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowRight, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

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

  // Password strength checker
  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength === 0) return "Very weak";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
    return "Very strong";
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-yellow-300";
    if (passwordStrength >= 4) return "bg-green-500";
    return "";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate and sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedName = sanitizeInput(name.trim());

    // Validate form
    if (!sanitizedEmail || !password || !confirmPassword || !sanitizedName) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError("Please use a stronger password");
      setIsLoading(false);
      return;
    }

    // Check for common passwords (in a real app, this would be a more comprehensive check)
    const commonPasswords = ["password", "123456", "qwerty", "admin"];
    if (commonPasswords.includes(password.toLowerCase())) {
      setError("This password is too common. Please choose a more secure one.");
      setIsLoading(false);
      return;
    }

    // Rate limiting check (in a real app, this would be handled by the server)
    const signupAttempts = parseInt(localStorage.getItem("signupAttempts") || "0", 10);
    const lastAttemptTime = parseInt(localStorage.getItem("lastSignupAttempt") || "0", 10);
    const now = Date.now();
    
    if (signupAttempts >= 3 && (now - lastAttemptTime) < 60000) {
      setError("Too many signup attempts. Please try again in a minute.");
      setIsLoading(false);
      return;
    }

    // Update rate limiting data
    localStorage.setItem("signupAttempts", (signupAttempts + 1).toString());
    localStorage.setItem("lastSignupAttempt", now.toString());
    
    // Reset rate limiting after 1 minute
    if ((now - lastAttemptTime) >= 60000) {
      localStorage.setItem("signupAttempts", "1");
    }

    try {
      await signUp(sanitizedEmail, password, {
        full_name: sanitizedName,
      });
    } catch (error: any) {
      setError(error.message || "Error creating account");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-gray-500 mt-2">Join Orunlink to discover and collaborate on amazing projects</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* CSRF token would be here in a real app */}
            <input type="hidden" name="csrf_token" value="dummy-csrf-token" />
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                maxLength={50}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                maxLength={100}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Create a password"
                  required
                  className="pr-10"
                  maxLength={100}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">
                      Password strength: {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full">
                    <div
                      className={`h-1 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-2">
                    <Alert variant="default" className="bg-gray-50">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Password should be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                maxLength={100}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orunlink-purple hover:bg-orunlink-dark"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-orunlink-purple hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Orunlink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Signup;
