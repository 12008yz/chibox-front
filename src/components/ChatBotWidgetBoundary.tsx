import { Component } from 'react';
import ChatBotWidget from './ChatBotWidget';

/**
 * Если виджет чата упадёт (например на старом браузере/мобильном), сайт продолжит работать.
 */
export default class ChatBotWidgetBoundary extends Component<object, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return <ChatBotWidget />;
  }
}
