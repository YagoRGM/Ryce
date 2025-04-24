// Rian e Yago n28 e n31
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Splash({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home'); 
    }, 3000); 

    return () => clearTimeout(timer); 
  }, [navigation]);

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
