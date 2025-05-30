declare module 'react-native-webview' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface WebViewProps extends ViewProps {
    source: { uri: string } | { html: string };
    onMessage?: (event: { nativeEvent: { data: string } }) => void;
    originWhitelist?: string[];
    injectedJavaScript?: string;
  }

  export default class WebView extends Component<WebViewProps> {}
} 