
cordova plugin add com-darryncampbell-cordova-plugin-intent

cordova platform add android@8

cordova prepare android

if [ $1 = "run" ]; then
    # run
    cordova run android
elif [ $1 = "build" ]; then
    # build
    # cordova build android --release --archs=arm --device --ant
    cordova build android --archs=arm --device
else
    echo "cordova init success"
fi
