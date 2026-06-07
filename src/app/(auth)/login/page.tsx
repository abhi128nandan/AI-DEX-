"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getSiteUrl } from "@/lib/utils";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -------------------------------------------------------------
// Typewriter Component
// -------------------------------------------------------------
export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

// -------------------------------------------------------------
// Base UI Components (Label, Button, Input)
// -------------------------------------------------------------
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(124,58,237,0.3)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/10 bg-[#12121c] text-slate-200 hover:bg-white/5 hover:text-white transition-all duration-300",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
        link: "text-purple-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} suppressHydrationWarning {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        suppressHydrationWarning
        className={cn(
          "flex h-10 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-purple-500 focus-visible:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// -------------------------------------------------------------
// Validation Logic
// -------------------------------------------------------------
const usePasswordValidation = (password: string) => {
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  return validations;
};

// -------------------------------------------------------------
// Auth Forms integrated with Supabase
// -------------------------------------------------------------
function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (event: React.FormEvent | React.MouseEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid login credentials");
        return;
      }

      onSuccess();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}auth/callback`,
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setError("Password reset link sent to your email.");
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6" suppressHydrationWarning>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Sign in</h1>
        <p className="text-sm text-slate-400">Welcome back to AIDex</p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
        </div>
        
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
             <Label>Password</Label>
             <button type="button" onClick={handleForgotPassword} className="text-xs text-purple-400 hover:text-purple-300">Forgot Password?</button>
          </div>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
        </div>

        {error && <div className="text-red-500 text-sm mt-2 mb-2 text-center">{error}</div>}

        <Button type="submit" onClick={handleSignIn} className="mt-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  
  const validations = usePasswordValidation(password);
  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPasswordValid) {
        setError("Please ensure your password meets all requirements.");
        return;
    }
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || "Failed to complete registration.");
      } else {
        setSuccessMessage(data.message || "Email sent successfully.");
        setIsRegistered(true);
      }
    } catch (err) {
      setLoading(false);
      console.error("[UI] Registration fetch block failed:", err);
      setError("A network error occurred. Please try again.");
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || "Failed to resend email.");
      } else {
        setError("Success! Another verification email has been dispatched.");
      }
    } catch (err) {
      setLoading(false);
      console.error("[UI] Resend fetch block failed:", err);
      setError("A network error occurred. Please try again.");
    }
  };

  if (isRegistered) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
         <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 mb-2">
            <Check className="w-8 h-8" />
         </div>
         <h1 className="text-3xl font-bold tracking-tight text-white">Check your email</h1>
         <p className="text-sm text-slate-400 max-w-sm">
            We've sent a secure verification link to <strong className="text-white">{email}</strong>. Please click it to activate your account.
         </p>
         
         {successMessage && <div className="w-full p-3 text-sm bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-lg text-center">{successMessage}</div>}
         {error && <div className={`w-full p-3 text-sm border rounded-lg text-center ${error.startsWith('Success') ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>{error}</div>}

         <Button variant="outline" onClick={handleResend} disabled={loading} className="mt-4 w-full cursor-pointer">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Sending..." : "Resend Verification Email"}
         </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6" suppressHydrationWarning>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="text-sm text-slate-400">Join the ultimate AI discovery engine</p>
      </div>

      {error && <div className="p-3 text-sm bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-center">{error}</div>}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required disabled={loading} />
        </div>
        
        <div className="grid gap-2">
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" disabled={loading} />
          
          {/* Password Validator UI */}
          {password.length > 0 && (
            <div className="space-y-1.5 mt-1 bg-[#12121c] p-3 rounded-lg border border-white/5">
                {[
                    { key: validations.length, label: 'At least 8 characters' },
                    { key: validations.uppercase, label: 'One uppercase letter' },
                    { key: validations.number, label: 'One number' },
                    { key: validations.special, label: 'One special character' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                        {item.key ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-500" />}
                        <span className={item.key ? "text-emerald-400" : "text-slate-500"}>{item.label}</span>
                    </div>
                ))}
            </div>
          )}
        </div>

        <Button type="submit" className="mt-2" disabled={loading || (password.length > 0 && !isPasswordValid)}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {loading ? "Processing..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle, onSuccess }: { isSignIn: boolean; onToggle: () => void; onSuccess: () => void; }) {
    return (
        <div className="mx-auto grid w-full max-w-[380px] gap-4">
            {isSignIn ? <SignInForm onSuccess={onSuccess} /> : <SignUpForm onSuccess={onSuccess} />}
            <div className="text-center text-sm text-slate-400">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1" onClick={onToggle}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2674&auto=format&fit=crop",
        alt: "Abstract highly saturated flowing fluid shapes representing AI"
    },
    quote: {
        text: "The smartest tools in the world, just one click away.",
        author: "AIDex Discovery"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop",
        alt: "Vibrant abstract technological gradient"
    },
    quote: {
        text: "Unleash your ultimate workflow. Join the revolution.",
        author: "AIDex Community"
    }
};

export default function AuthPage({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const toggleForm = () => setIsSignIn((prev) => !prev);
  const handleSuccess = () => {
      router.push('/');
      router.refresh();
  };

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 bg-[#0a0a0f]">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Main Authentication Forms Pane */}
      <div className="flex h-screen items-center justify-center p-6 md:p-12 order-2 lg:order-1 relative z-10">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} onSuccess={handleSuccess} />
      </div>

      {/* Stunning Visual Right Sidebar with Typewriter Effect */}
      <div
        className="hidden lg:block relative bg-cover bg-center transition-all duration-1000 ease-in-out order-1 lg:order-2 overflow-hidden border-l border-white/5 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0a0f] to-transparent via-[#0a0a0f]/80" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-12 pb-24">
            <blockquote className="space-y-6 text-center text-white max-w-lg">
              <p className="text-3xl font-medium tracking-tight leading-tight">
                “<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={50}
                  />”
              </p>
              <cite className="block text-sm font-semibold tracking-wider text-purple-400 uppercase not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
