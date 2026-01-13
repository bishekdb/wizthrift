import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { signUpSchema, signInSchema } from '@/lib/validation';
import { z } from 'zod';
import { isSafeRedirectURL } from '@/lib/security';

type AuthMode = 'login' | 'signup';

// Rate limiting: Max 5 attempts per 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  
  // Rate limiting
  const attemptCount = useRef(0);
  const lockoutUntil = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      // Validate redirect URL to prevent open redirects
      let from = '/';
      if (redirect && isSafeRedirectURL(redirect)) {
        from = redirect;
      } else if ((location.state as { from?: string })?.from) {
        const statePath = (location.state as { from?: string }).from || '/';
        from = isSafeRedirectURL(statePath) ? statePath : '/';
      }
      
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state, location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    
    // Show password strength for signup
    if (name === 'password' && mode === 'signup') {
      updatePasswordStrength(value);
    }
  };
  
  const updatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) setPasswordStrength('Weak');
    else if (strength === 3 || strength === 4) setPasswordStrength('Medium');
    else setPasswordStrength('Strong');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const now = Date.now();
    if (lockoutUntil.current && now < lockoutUntil.current) {
      const remainingMinutes = Math.ceil((lockoutUntil.current - now) / 60000);
      toast.error(`Too many attempts. Please try again in ${remainingMinutes} minute(s).`);
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Validate input based on mode
      if (mode === 'login') {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setIsSubmitting(false);
          toast.error('Please fix the validation errors');
          return;
        }
        
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          attemptCount.current++;
          if (attemptCount.current >= MAX_ATTEMPTS) {
            lockoutUntil.current = Date.now() + LOCKOUT_DURATION;
            toast.error(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`);
            setIsSubmitting(false);
            return;
          }
          
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          setIsSubmitting(false);
          return;
        }
        
        // Reset attempts on success
        attemptCount.current = 0;
        lockoutUntil.current = null;
        toast.success('Welcome back!');
      } else {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
          setIsSubmitting(false);
          toast.error('Please fix the validation errors');
          return;
        }
        
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
          setIsSubmitting(false);
          return;
        }
        
        // Sign up successful - automatically sign in
        toast.success('Account created successfully!');
        
        // Immediately sign in the user (works if email confirmation is disabled)
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          // Email confirmation might be required
          toast.info('Please check your email to confirm your account, then sign in.');
          setMode('login');
          setIsSubmitting(false);
          return;
        }
        
        // Successfully signed in
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-narrow py-16 md:py-24">
          <div className="max-w-sm mx-auto text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-narrow py-16 md:py-24">
        <div className="max-w-sm mx-auto">
          <h1 className="text-title mb-2">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-small text-muted-foreground mb-8">
            {mode === 'login'
              ? 'Welcome back. Enter your details below.'
              : 'Create an account to track your orders.'}
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Label htmlFor="name" className="text-small text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                  aria-invalid={!!validationErrors.name}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-small text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                aria-invalid={!!validationErrors.email}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-small text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1"
                aria-invalid={!!validationErrors.password}
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
              {mode === 'signup' && passwordStrength && (
                <p className={`text-xs mt-1 ${
                  passwordStrength === 'Weak' ? 'text-red-500' :
                  passwordStrength === 'Medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  Password strength: {passwordStrength}
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Must include: 8+ characters, uppercase, lowercase, number, special character
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-small text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
