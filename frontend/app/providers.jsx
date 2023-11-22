'use client'
import {ThemeProvider} from 'next-themes'
import {ReCaptchaProvider} from "next-recaptcha-v3";
import { NotificationProvider } from '@/providers/NotificationContext';

export function Providers({children}) {
    return (
        <NotificationProvider>
            <ReCaptchaProvider>
              <ThemeProvider attribute="class">
                  {children}
              </ThemeProvider>
            </ReCaptchaProvider>
        </NotificationProvider>
    )
}
