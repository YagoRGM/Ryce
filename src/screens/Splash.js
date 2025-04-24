import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Página: Splash</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // fundo escuro
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 20
  }
});
