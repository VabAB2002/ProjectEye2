#!/bin/bash

echo "🤖 Android Emulator Setup & Testing Script"
echo "=========================================="

# Check if emulator is running
echo "1. Checking if Android emulator is running..."
if adb devices | grep -q "emulator"; then
    echo "✅ Android emulator is running!"
    adb devices
else
    echo "❌ No Android emulator found"
    echo "Starting emulator..."
    /Users/V-Personal/Library/Android/sdk/emulator/emulator @Medium_Phone_API_36.0 -no-audio -no-snapshot -memory 2048 -cores 4 &
    echo "Waiting for emulator to boot..."
    sleep 30
fi

# Check connectivity
echo ""
echo "2. Testing ADB connectivity..."
adb devices

# Install Expo Go if needed
echo ""
echo "3. Installing Expo Go on emulator..."
adb install -r ~/.expo/android-apk-cache/expo-go-*.apk 2>/dev/null || echo "Expo Go will be downloaded automatically"

echo ""
echo "4. Opening ProjectEye app..."
echo "In your Expo terminal, press 'a' to open on Android"
echo ""
echo "🎉 Android setup complete!"
echo "If you still have issues, try:"
echo "  • Press 'a' in Expo terminal"
echo "  • Use web version: press 'w'"
echo "  • Scan QR code with physical Android device" 