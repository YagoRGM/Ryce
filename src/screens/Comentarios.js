import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Comentarios() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Página: Comentarios</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Exemplo de Botão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fundo preto
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff', // texto branco
    fontSize: 18, // tamanho de fonte ajustado
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff', // botão branco
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000', // texto preto
    fontSize: 16,
    fontWeight: 'bold',
  },
});
