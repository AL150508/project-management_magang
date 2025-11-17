"use client"

import { useRef, forwardRef, useImperativeHandle } from "react"
import ReCAPTCHA from "react-google-recaptcha"

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  theme?: "light" | "dark"
  size?: "compact" | "normal" | "invisible"
}

export interface RecaptchaRef {
  reset: () => void
  execute: () => void
}

export const RecaptchaWrapper = forwardRef<RecaptchaRef, RecaptchaWrapperProps>(
  ({ onVerify, onExpired, onError, theme = "light", size = "normal" }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null)

    // Gunakan site key dari environment variables
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    
    console.log("🔍 reCAPTCHA Site Key:", process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? "✅ Using Production Key" : "🧪 Using Test Key")
    console.log("🔑 Site Key (first 20 chars):", siteKey.substring(0, 20) + "...")

    // useImperativeHandle harus dipanggil sebelum early return
    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset()
      },
      execute: () => {
        recaptchaRef.current?.execute()
      }
    }))

    // Handle reCAPTCHA callbacks
    const handleVerify = (token: string | null) => {
      console.log("✅ reCAPTCHA verified:", token ? "Success" : "Failed")
      onVerify(token)
    }

    const handleExpired = () => {
      console.log("⏰ reCAPTCHA expired")
      onExpired?.()
    }

    const handleError = () => {
      console.log("❌ reCAPTCHA error")
      onError?.()
    }

    return (
      <div className="flex justify-center my-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleVerify}
          onExpired={handleExpired}
          onError={handleError}
          theme={theme}
          size={size}
        />
      </div>
    )
  }
)

RecaptchaWrapper.displayName = "RecaptchaWrapper"
