# PE Office Management - Welcome Splash Animation

## Current State
App opens directly to LandingPage with basic fade-in motion. No splash screen or welcome animation exists. App name shows as "AttendPro".

## Requested Changes (Diff)

### Add
- A full-screen animated splash screen component (SplashScreen.tsx) that appears when the app first loads
- Shows "Welcome to PE Office Management" with professional staggered animations
- Animated logo/icon, company name, tagline, and loading progress bar
- Auto-dismisses after ~3 seconds then transitions smoothly to LandingPage

### Modify
- App.tsx: Add splash screen state that shows SplashScreen first, then transitions to LandingPage
- LandingPage.tsx: Update branding from "AttendPro" to "PE Office Management"

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/SplashScreen.tsx` with full-screen animated welcome
   - Animated background with floating particles or gradient shimmer
   - Staggered entrance: logo icon → company name → tagline → loading bar
   - Professional color scheme matching existing dark theme
   - Exits with fade/scale-out after 3s
2. Update `App.tsx` to show SplashScreen first (showSplash state), then LandingPage
3. Update LandingPage header branding to "PE Office Management"
