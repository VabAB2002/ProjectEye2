# 🏗️ ProjectEye - Construction Management App

A comprehensive React Native construction management application built with Expo and TypeScript.

## 📱 Features

### 🎯 Core Features
- **Project Management**: Create, track, and manage construction projects
- **Team Management**: Add team members with role-based access control
- **Progress Tracking**: Upload progress photos with real-time updates
- **Milestone Management**: Set and track project milestones
- **Financial Tracking**: Budget management and expense tracking
- **Analytics Dashboard**: Comprehensive project health metrics

### 📊 Advanced Analytics
- **Smart Health Cards**: Real-time project health indicators
- **Trending Indicators**: Visual progress trends with up/down arrows
- **Smart Alerts System**: Automated warnings for budget, timeline, and team issues
- **PDF Report Generation**: Professional PDF reports with beautiful styling
- **WhatsApp Integration**: Quick report sharing via WhatsApp

### 🔐 Authentication & Security
- **Secure Login**: Email/phone and password authentication
- **Role-based Access**: Different access levels for owners, contractors, and team members
- **JWT Token Management**: Secure token-based authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/VabAB2002/ProjectEye2.git
cd ProjectEye2
```

2. **Install dependencies**
```bash
npm install
```

3. **Install PDF generation dependencies (optional)**
```bash
expo install expo-print expo-sharing
```

4. **Start the development server**
```bash
npm start
# or
expo start
```

## 🏗️ Project Structure

```
src/
├── api/                    # API client and endpoints
├── components/            
│   ├── cards/             # Reusable card components
│   ├── common/            # Common UI components
│   └── forms/             # Form components
├── navigation/            # Navigation configuration
├── screens/              
│   ├── analytics/         # Analytics and reporting screens
│   ├── auth/              # Authentication screens
│   ├── financial/         # Financial management screens
│   ├── milestones/        # Milestone management screens
│   ├── progress/          # Progress tracking screens
│   ├── projects/          # Project management screens
│   ├── settings/          # Settings screens
│   └── team/              # Team management screens
├── services/              # Business logic services
├── store/                 # State management (Zustand)
├── theme/                 # Theme configuration
└── utils/                 # Utility functions
```

## 📊 Analytics Features

### Health Cards with Trending Indicators
- **Budget Status**: Real-time budget utilization with trend arrows
- **Work Progress**: Milestone completion tracking with progress indicators
- **Team Activity**: Team engagement metrics with activity trends

### Smart Alerts System
- **Budget Alerts**: Automated warnings when budget exceeds 85%
- **Timeline Risks**: Critical alerts for potential deadline misses
- **Team Communication**: Notifications for missing progress updates
- **Success Recognition**: Positive alerts for ahead-of-schedule projects

### PDF Report Generation
- **Professional Layout**: Beautiful HTML-to-PDF conversion
- **Comprehensive Data**: All project metrics and alerts included
- **One-click Sharing**: Easy sharing via email, cloud storage, or messaging apps

## 🔧 Configuration

### Backend Setup
The app connects to a backend API. Configure the API endpoint in:
```typescript
// src/api/client.ts
const BASE_URL = 'your-api-endpoint';
```

### Theme Customization
Customize the app's appearance in:
```typescript
// src/theme/index.ts
export const theme = {
  colors: { /* your colors */ },
  spacing: { /* your spacing */ },
  // ... other theme properties
};
```

## 📱 Available Scripts

```bash
npm start          # Start the Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run build      # Create production build
```

## 🔒 Environment Variables

Create a `.env` file in the root directory:
```env
API_BASE_URL=your_api_endpoint
JWT_SECRET=your_jwt_secret
```

## 🎨 UI Components

Built with modern React Native components:
- **Button**: Customizable button component with variants
- **Input**: Styled input fields with validation
- **Card**: Reusable card layouts
- **Theme**: Consistent design system

## 📦 Dependencies

### Core Dependencies
- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **TypeScript**: Type safety and developer experience
- **React Navigation**: Navigation library
- **Zustand**: State management
- **React Hook Form**: Form handling

### UI & Styling
- **Expo Vector Icons**: Icon library
- **React Native Safe Area Context**: Safe area handling

### Optional Features
- **expo-print**: PDF generation
- **expo-sharing**: File sharing
- **expo-clipboard**: Clipboard operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for the amazing development platform
- All contributors who have helped improve this project

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the construction industry** 