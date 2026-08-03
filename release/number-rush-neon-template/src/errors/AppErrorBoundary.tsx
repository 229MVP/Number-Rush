import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, neonGlow, radii, withAlpha } from '../theme';
import { reportError } from './errorReporter';

type Props = {
  children: ReactNode;
  onReset?: () => void;
  onReturnHome?: () => void;
  currentScreen?: string;
};

type State = {
  hasError: boolean;
  message: string;
  name: string;
  showDetails: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
    name: '',
    showDetails: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      message: error.message,
      name: error.name,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      screen: this.props.currentScreen,
      componentStack: info.componentStack,
    });
  }

  private reset = () => {
    this.setState({
      hasError: false,
      message: '',
      name: '',
      showDetails: false,
    });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root} testID="error-boundary">
        <Text style={[styles.title, neonGlow(colors.red, 10)]}>
          SOMETHING WENT WRONG
        </Text>
        <Text style={styles.body}>
          Number Rush hit an unexpected error. Your local progress should still
          be saved.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          testID="error-try-again"
          onPress={this.reset}
          style={[styles.btn, { borderColor: colors.cyan }]}
        >
          <Text style={[styles.btnText, { color: colors.cyan }]}>TRY AGAIN</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to main menu"
          testID="error-return-home"
          onPress={() => {
            this.reset();
            this.props.onReturnHome?.();
          }}
          style={[styles.btn, { borderColor: colors.electricBlue }]}
        >
          <Text style={[styles.btnText, { color: colors.electricBlue }]}>
            RETURN TO MAIN MENU
          </Text>
        </Pressable>
        {__DEV__ ? (
          <Pressable
            onPress={() =>
              this.setState((s) => ({ showDetails: !s.showDetails }))
            }
            style={styles.devToggle}
          >
            <Text style={styles.devToggleText}>
              {this.state.showDetails ? 'Hide' : 'Show'} dev details
            </Text>
          </Pressable>
        ) : null}
        {__DEV__ && this.state.showDetails ? (
          <Text style={styles.devDetails}>
            {this.state.name}: {this.state.message}
          </Text>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    fontFamily: fontFamilies.orbitronBlack,
    fontSize: 22,
    color: colors.red,
    letterSpacing: 1,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    minWidth: 220,
    minHeight: 44,
    borderRadius: radii.card,
    borderWidth: 1,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: {
    fontFamily: fontFamilies.orbitronBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  devToggle: { marginTop: 8 },
  devToggleText: {
    fontFamily: fontFamilies.rajdhaniBold,
    fontSize: 12,
    color: withAlpha(colors.yellow, 0.8),
  },
  devDetails: {
    fontFamily: fontFamilies.rajdhaniSemiBold,
    fontSize: 11,
    color: colors.yellow,
    textAlign: 'center',
  },
});
