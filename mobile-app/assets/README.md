# Mobile App Assets

This directory contains the assets for the mobile application:

## Required Assets

To complete the mobile app setup, you'll need to add these image files:

### **App Icons**
- `icon.png` (1024x1024) - Main app icon
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (32x32) - Web favicon

### **Splash Screen**
- `splash.png` (1242x2436) - Launch screen image

## Asset Guidelines

### **App Icon Design**
- Use the graduation cap or calendar icon theme
- Colors: Primary blue (#3B82F6) and secondary pink (#EC4899)
- Simple, recognizable design that works at small sizes
- No text in the icon (will be unreadable at small sizes)

### **Splash Screen Design**
- App name: "Student Class Management"
- Subtitle: "Track Classes & Generate Reports"
- Clean, professional design
- Match the app's color scheme

## Creating Assets

You can create these assets using:
- **Design Tools**: Figma, Sketch, Adobe Illustrator
- **Online Generators**: App icon generators
- **Templates**: Use Expo's asset templates

## Asset Placement

Place the following files in this directory:
```
assets/
├── icon.png
├── adaptive-icon.png
├── splash.png
└── favicon.png
```

## Expo Asset Management

Expo will automatically:
- Generate different sizes for various devices
- Handle platform-specific formatting
- Optimize assets for production builds

For more information on assets, visit:
https://docs.expo.dev/guides/assets/