import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Comentarios() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Página: Comentarios</Text>
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
