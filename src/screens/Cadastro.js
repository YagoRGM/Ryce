import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Swal from 'sweetalert2'; // Importando o SweetAlert2
import { auth, db } from '../config/FireBaseConfig'; // Certifique-se de que o FireBaseConfig está configurado corretamente

export default function Cadastro() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Swal.fire({
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    setLoading(true);
    try {
      // Criação do usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salvando o nome do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        nome: nome,
        email: email,
        uid: user.uid,
      });

      Swal.fire({
        title: 'Cadastro realizado!',
        text: 'Bem-vindo à nossa rede social!',
        icon: 'success',
        confirmButtonText: 'Ir para o Início',
      }).then(() => {
        navigation.navigate('Inicio'); // tentei redirecionar pro login mas nao vai aaaaaaaaaa
      });
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: error.message || 'Não foi possível realizar o cadastro.',
        icon: 'error',
        confirmButtonText: 'Tentar novamente',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />

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

      <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem uma conta? Entrar</Text>
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
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
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
    backgroundColor: '#09b391',
    padding: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    color: '#aaa',
    textDecorationLine: 'underline',
  },
});
