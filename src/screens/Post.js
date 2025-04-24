import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/FireBaseConfig';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const uploadImageToS3 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `img-post/${Date.now()}.jpg`; // pasta específica pra posts
    const uploadUrl = `https://app-ryce.s3.amazonaws.com/${fileName}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Erro ao enviar imagem:', errorText);
      throw new Error('Falha no upload da imagem');
    }

    return uploadUrl;
  } catch (err) {
    console.error('Erro ao enviar imagem com fetch:', err);
    throw err;
  }
};


export default function Post({ navigation }) {
  const [texto, setTexto] = useState('');
  const [imagem, setImagem] = useState(null);
  const [nome, setNome] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    // Buscar o nome do usuário no Firestore
    const buscarNome = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setNome(userData.nome); // aqui pega o nome do usuário e salva no estado
        }
      } catch (error) {
        console.log('Erro ao buscar nome do usuário:', error);
      }
    };

    if (user) {
      buscarNome();
    }
  }, []);

  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const postar = async () => {
    if (texto.trim() === '') {
      Alert.alert('Erro', 'Digite alguma coisa antes de postar!');
      return;
    }

    let imagemUrl = '';

    if (imagem) {
      try {
        imagemUrl = await uploadImageToS3(imagem, `img-post/${user.uid}-${Date.now()}.jpg`);
      } catch (error) {
        console.log('Erro ao fazer upload da imagem:', error);
        Alert.alert('Erro', 'Não foi possível enviar a imagem.');
        return;
      }
    }

    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        nome: nome, // nome do usuário agora vai no post
        userPhoto: user.photoURL || '',
        texto: texto,
        imagemUrl: imagemUrl,
        timestamp: serverTimestamp(),
      });

      setTexto('');
      setImagem(null);
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao postar:', error);
      Alert.alert('Erro', 'Não foi possível criar a publicação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar publicação</Text>

      <TextInput
        style={styles.input}
        placeholder="O que está acontecendo?"
        placeholderTextColor="#aaa"
        multiline
        value={texto}
        onChangeText={setTexto}
      />

      {imagem && <Image source={{ uri: imagem }} style={styles.previewImage} />}

      <TouchableOpacity onPress={escolherImagem} style={styles.button}>
        <Text style={styles.buttonText}>Escolher Imagem (opcional)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={postar} style={[styles.button, { backgroundColor: '#09b391' }]}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 10,
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  previewImage: {
    marginTop: 15,
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});
