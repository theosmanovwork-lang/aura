import { StyleSheet, Text, View } from 'react-native';

import { ru } from '../src/i18n/ru';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ru.home.greeting}</Text>
      <Text style={styles.subtitle}>{ru.home.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  subtitle: { marginTop: 12, fontSize: 16, textAlign: 'center', color: '#555555' },
});
