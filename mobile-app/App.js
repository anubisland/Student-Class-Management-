import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  View,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const source = { uri: 'file:///android_asset/www/index.html' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <WebView
        ref={webViewRef}
        source={source}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default App;