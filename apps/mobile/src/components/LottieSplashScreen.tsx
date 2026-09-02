import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieSplashScreenProps {
  onFinish: () => void;
}

export function LottieSplashScreen({ onFinish }: LottieSplashScreenProps) {
  const hasFinishedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinish = () => {
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      onFinish();
    }
  };

  useEffect(() => {
    // 4-second fallback safety timer in case onAnimationFinish doesn't trigger
    timeoutRef.current = setTimeout(() => {
      handleFinish();
    }, 4000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <LottieView
        source={require('../../assets/animations/turtle-splash.json')}
        autoPlay
        loop={false}
        resizeMode="contain"
        onAnimationFinish={handleFinish}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default LottieSplashScreen;
