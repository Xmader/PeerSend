APK_NAME=$(node -p "const {version,displayName}=require('./package.json');displayName+'-v'+version")
mkdir -p dist
mv ./platforms/android/build/outputs/apk/android-*.apk ./dist/$APK_NAME.apk
