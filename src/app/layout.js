import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import Navbar from "./components/Navbar";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { icons } from "lucide-react";
import GlobalLoadingBar from "./components/GlobalLoadingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "To-Do-List",
  icons: {
    icon: "/to-do.svg",
  },
};


export default function RootLayout({ children }) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Top Auth Bar */}


            {/* Main Navigation */}
            {/* Page Content */}
            <CopilotKit publicApiKey="ck_pub_eaa14f374fe14333610590fb63e7ec31">
              <GlobalLoadingBar />
              <Navbar/>
              {children}
            </CopilotKit>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
