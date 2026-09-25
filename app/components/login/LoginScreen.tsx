"use client";

/* eslint-disable @next/next/no-img-element -- static brand SVGs */
import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "../../login/login.module.css";

const MoltenPanes = dynamic(() => import("./molten-panes"), { ssr: false });

type Mode = "login" | "signup" | "forgot";

// Design only: forms are not wired to any backend.
export function LoginScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Mode switches fade/rise the form and tween the block height so the logos glide.
  const pageRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number | null>(null);
  const previousMode = useRef(mode);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const observer = new ResizeObserver(() => setFormHeight(page.offsetHeight));
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || previousMode.current === mode) return;
    previousMode.current = mode;
    page.classList.add("is-enter-start");
    void page.offsetWidth;
    const frame = requestAnimationFrame(() => page.classList.remove("is-enter-start"));
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  const submitLabel = isLogin ? "Sign in" : isSignup ? "Create account" : "Send email";

  return (
    <div className={styles.page}>
      <img src="/svg/logologinn.svg" alt="" width={54} height={53} className={styles.watermark} />

      {/* Left panel (WebGL molten panes) — notebook and up */}
      <div className={styles.hero}>
        <div className={styles.heroCanvas}>
          <MoltenPanes />
        </div>
      </div>

      {/* Right panel (form) */}
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.brand}>
              <img src="/svg/nebulab-logo.svg" alt="Nebulab" width={229} height={53} className={styles.logo} />
            </div>

            <div className={styles.sizer} style={formHeight === null ? undefined : { height: formHeight }}>
              <div ref={pageRef} className="t-page">
                {isForgot && <p className={styles.subtitle}>Reset your password</p>}
                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.fields}>
                    {isSignup && (
                      <div className={styles.field}>
                        <label htmlFor="name" className={styles.label}>Name</label>
                        <input id="name" type="text" autoComplete="name" placeholder="Your name" className={styles.input} />
                      </div>
                    )}

                    <div className={styles.field}>
                      <label htmlFor="email" className={styles.label}>Email</label>
                      <input id="email" type="email" autoComplete="email" placeholder="your@email.com" className={styles.input} />
                    </div>

                    {!isForgot && (
                      <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.passwordWrap}>
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            placeholder="••••••••"
                            className={`${styles.input} ${styles.passwordInput}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className={styles.eye}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            <EyeIcon className={showPassword ? undefined : styles.iconHidden} />
                            <EyeOffIcon className={showPassword ? styles.iconHidden : undefined} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button type="submit" className={styles.primary}>{submitLabel}</button>
                    {isLogin && (
                      <button type="button" onClick={() => setMode("signup")} className={styles.secondary}>
                        Create account
                      </button>
                    )}
                  </div>

                  <p className={styles.footer}>
                    {isLogin ? (
                      <button type="button" onClick={() => setMode("forgot")} className={styles.link}>
                        ¿Forgot your password?
                      </button>
                    ) : (
                      <button type="button" onClick={() => setMode("login")} className={styles.link}>
                        {isSignup ? "Already have an account? Sign in" : "Back to sign in"}
                      </button>
                    )}
                  </p>
                </form>
              </div>
            </div>
          </div>

          <img src="/svg/logologinn.svg" alt="" width={54} height={53} className={styles.cardWatermark} />
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <path d="M1.88933 10.681C1.81293 10.8868 1.81293 11.1132 1.88933 11.319C2.63339 13.1231 3.89638 14.6657 5.5182 15.7511C7.14002 16.8366 9.04762 17.4161 10.9992 17.4161C12.9507 17.4161 14.8583 16.8366 16.4801 15.7511C18.1019 14.6657 19.3649 13.1231 20.109 11.319C20.1854 11.1132 20.1854 10.8868 20.109 10.681C19.3649 8.87683 18.1019 7.33425 16.4801 6.24879C14.8583 5.16332 12.9507 4.58386 10.9992 4.58386C9.04762 4.58386 7.14002 5.16332 5.5182 6.24879C3.89638 7.33425 2.63339 8.87683 1.88933 10.681Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 13.75C12.5188 13.75 13.75 12.5188 13.75 11C13.75 9.48122 12.5188 8.25 11 8.25C9.48122 8.25 8.25 9.48122 8.25 11C8.25 12.5188 9.48122 13.75 11 13.75Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={className} aria-hidden>
      <path d="M9.83887 4.65301C11.9741 4.39855 14.134 4.84993 15.9887 5.93822C17.8433 7.02652 19.2908 8.69192 20.1101 10.6801C20.1865 10.8859 20.1865 11.1123 20.1101 11.3181C19.7732 12.1348 19.328 12.9026 18.7864 13.6006" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.9105 12.9782C12.3918 13.4791 11.6971 13.7563 10.9761 13.75C10.2551 13.7437 9.56533 13.4545 9.05546 12.9447C8.54558 12.4348 8.25637 11.7451 8.2501 11.024C8.24384 10.303 8.52102 9.60832 9.02196 9.08966" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.0216 16.0407C14.8056 16.761 13.4489 17.2113 12.0436 17.3611C10.6382 17.5108 9.21712 17.3566 7.87666 16.9087C6.5362 16.4608 5.30775 15.7299 4.27469 14.7654C3.24162 13.8009 2.4281 12.6255 1.88933 11.319C1.81293 11.1132 1.81293 10.8868 1.88933 10.681C2.70207 8.71 4.13211 7.05578 5.96483 5.96655" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.83301 1.83331L20.1663 20.1666" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
