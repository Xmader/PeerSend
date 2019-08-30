APK_NAME=$(node -p "const {version,displayName}=require('./package.json');displayName+'-v'+version")
mkdir -p dist
mv ./platforms/android/app/build/outputs/apk/debug/*.apk ./dist/$APK_NAME.apk
