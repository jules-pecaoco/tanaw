# Tanaw - Hazard Mapping and Emergency Response Application

## Overview

Tanaw is a mobile application built with React Native and Expo that provides real-time hazard mapping, heat index monitoring, and emergency facility locations. The app helps users stay informed about potential hazards and access emergency services when needed.

## Features

- 🌡️ Real-time heat index monitoring
- 🗺️ Interactive hazard mapping
- 🏥 Emergency facilities locator
- 📊 Hazard analytics and visualization
- 🔔 Alert and notification system

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) (optional)
- Xcode (for iOS development, macOS only) (optional)
- Mapbox Account and Access Token

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jules-pecaoco/tanaw.git
   cd tanaw
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:

   ```env
   MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

4. **Run the development server:**

   ```bash
   npx expo start
   ```

5. **Platform-specific commands:**

   ```bash
   # Run on Android
   npx expo run:android

   # Run on iOS
   npx expo run:ios
   ```

## Project Structure

```
tanaw/
├── app/                    # Application navigation and screens
│   ├── (tabs)/            # Tab-based navigation
│   ├── (permissions)/     # Permission-related screens
│   └── _layout.jsx        # Root layout configuration
├── assets/                # Static assets
│   ├── fonts/            # Custom fonts
│   ├── icons/            # Application icons
│   └── images/           # Images and graphics
├── constants/            # Application constants
│   ├── assets.js        # Asset references
│   ├── fonts.js         # Font configurations
│   └── theme.js         # Theme constants
├── data/                # Application data
│   ├── hazards/        # Hazard-related data
│   └── facilities/     # Facility information
├── hooks/              # Custom React hooks
│   ├── useLocation.js  # Location handling
│   └── useNotifications.js # Notification management
├── services/           # API and external services
│   ├── mapbox/        # Mapbox integration
│   └── weather/       # Weather API integration
├── storage/           # Local storage handling
├── tokens/            # API tokens and auth
├── utilities/         # Helper functions
│   ├── permissions.js # Permission handlers
│   └── validators.js  # Data validators
└── views/             # UI components
    ├── components/    # Reusable components
    ├── screens/       # Main screens
    └── widgets/       # Feature-specific widgets
```

## Key Technologies

- React Native
- Expo
- Mapbox GL
- React Navigation
- Expo Location
- Expo Notifications
- TailwindCSS (NativeWind)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


