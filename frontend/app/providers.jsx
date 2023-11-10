'use client'
import {ThemeProvider} from 'next-themes'
import {ReCaptchaProvider} from "next-recaptcha-v3";

export function Providers({children}) {
    return (
        <ReCaptchaProvider>
          <ThemeProvider attribute="class">
              {children}
          </ThemeProvider>
        </ReCaptchaProvider>
    )
}