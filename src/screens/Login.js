// Rian e Yago n28 e n31
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { auth } from '../config/FireBaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert('Erro, Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      console.log('Login efetuado com sucesso!');
    } catch (error) {
      console.log(error);
      alert('Erro no login, Email ou senha inválidos');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.textoBotao}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Criar uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100, // Largura da logo
    height: 70, // Altura proporcional
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#fff', // Botão branco
    padding: 15,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#000', // Texto preto
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#aaa',
    textDecorationLine: 'underline',
  },
});
