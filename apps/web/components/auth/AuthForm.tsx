"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { loginSchema, signUpSchema } from "@/validators";
import { ArrowRight, Video, Lock, Mail, User, AlertCircle, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { GoogleIcon } from "../icon";
import GithubIcon from "../icon/GithubIcon";
import { env } from "@/config/env";

interface AuthFormProps {
  mode: "login" | "register";
}

function LabelInput({
  label,
  type="text",
  placeholder="placeholder...",
  value,
  onChange,
  error,
  Icon,
}: {
  label: string,
  type: string,
  value: string,
  placeholder: string,
  error?: string,
  Icon: LucideIcon,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}) {
  return (
    <div>
      <label className="block font-handwritten text-sm font-bold text-neutral-800 mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 text-neutral-500 absolute z-10 left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`sketch-input w-full pl-9 text-sm ${
            error ? "border-red-600 bg-red-50/50" : ""
          }`}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-600 font-medium mt-1 font-handwritten">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (mode === "login") {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
        return;
      }

      setIsLoading(true);
      try {
        const { error: signInError } = await signIn.email({
          email: result.data.email,
          password: result.data.password,
        });

        if (signInError) {
          setFormError(signInError.message || "Invalid email or password.");
          setIsLoading(false);
          return;
        }

        router.push("/videos");
        router.refresh();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
        setIsLoading(false);
      }
    } else {
      const result = signUpSchema.safeParse({ name, email, password });
      if (!result.success) {
        const errors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
        return;
      }

      setIsLoading(true);
      try {
        const { error: signUpError } = await signUp.email({
          email: result.data.email,
          password: result.data.password,
          name: result.data.name,
        });

        if (signUpError) {
          setFormError(signUpError.message || "Failed to create account. Please try again.");
          setIsLoading(false);
          return;
        }

        router.push("/videos");
        router.refresh();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative px-2 py-4">
      {/* Decorative paper tape accent holding card */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="w-28 h-6 bg-amber-100/90 border border-amber-200/80 shadow-xs rotate-[-1.5deg] backdrop-blur-xs flex items-center justify-center">
          <span className="text-[10px] font-handwritten text-amber-800/60 uppercase tracking-widest font-bold">
            video notes
          </span>
        </div>
      </div>

      <div className="sketch-card p-6 sm:p-8 relative bg-paper-card z-10">
        {/* Header Title */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-marker-yellow border-2 border-ink shadow-sketch-sm mb-3 -rotate-2">
            <Video className="w-6 h-6 text-ink" />
          </div>
          <h1 className="font-handwritten text-3xl font-bold text-ink mb-1">
            {mode === "login" ? "Welcome Back 👋" : "Register Account 📝"}
          </h1>
          <p className="text-sm text-neutral-600 font-medium">
            <span className="marker-highlight">Chat with any video</span>
          </p>
        </div>

        {/* Global Error Alert */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-ink rounded-lg flex items-start gap-2.5 shadow-sketch-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium">{formError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name only in register mode */}
          {mode === "register" && (
            <LabelInput
              label="Your Name"
              type="text"
              placeholder="e.g. Alex Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              Icon={User}
            />
          )}

          {/* Email Field */}
          <LabelInput
            label="Email"
            type="text"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            Icon={Mail}
          />


          {/* Password Field */}
          <LabelInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            Icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-2.5 text-sm mt-2"
            rightIcon={<ArrowRight className="w-4 h-4 text-ink" />}
          >
            {mode === "login" ? "Login" : "Register Account"}
          </Button>
          <div className="grid grid-cols-1 gap-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full py-2.5 text-sm mt-2"
              leftIcon={<GoogleIcon className="w-4 h-4" />}
              onClick={async () => { 
                await signIn.social({
                  provider: "google",
                  callbackURL: env.NEXT_PUBLIC_CALLBACK_URL
                })
              }}
            >
              Continue with Google
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              className="w-full py-2.5 text-sm mt-2"
              leftIcon={<GithubIcon className="w-6 h-6" />}
            >
              Continue with Github
            </Button> */}
          </div>
        </form>

        {/* Dedicated Route Link Footer */}
        <div className="mt-6 text-center border-t-2 border-dashed border-neutral-300 pt-4">
          <p className="text-xs text-neutral-600 font-medium">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-handwritten text-base font-bold text-neutral-900 underline underline-offset-2 hover:text-amber-600 ml-1 transition-colors"
                >
                  Login here
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-handwritten text-base font-bold text-neutral-900 underline underline-offset-2 hover:text-amber-600 ml-1 transition-colors"
                >
                  Register here
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
