import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // fundo escuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 130,
  },
});
