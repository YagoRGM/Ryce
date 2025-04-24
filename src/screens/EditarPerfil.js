import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { auth, db } from '../config/FireBaseConfig'; // Certifique-se de que a configuração do Firebase está correta
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Biblioteca para pegar imagem
import Swal from 'sweetalert2'; // SweetAlert2 para mostrar alertas bonitos

import s3 from '../config/AwsConfig';

export default function EditarPerfil() {
  const navigation = useNavigation();
  const user = getAuth().currentUser; // Pegando o usuário logado

  const [nome, setNome] = useState('');
  const [bio, setBio] = useState(''); // Adicionando campo para a bio
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar os dados do usuário no momento da inicialização
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNome(userData.nome);
          setBio(userData.bio || ''); // Adicionando a bio
          setFotoPerfil(userData.fotoPerfil || null);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const uploadImageToS3 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `img-perfil/${Date.now()}.jpg`;
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
  
      // Retornar a URL pública da imagem
      return uploadUrl;
    } catch (err) {
      console.error('Erro ao enviar imagem com fetch:', err);
      throw err;
    }
  };
  



  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      let fotoUrl = fotoPerfil;

      // Se for nova imagem (local), envia pro S3
      if (fotoPerfil && !fotoPerfil.startsWith('http')) {
        fotoUrl = await uploadImageToS3(fotoPerfil);
      }

      // Se ainda estiver undefined (sem imagem), forçar null
      if (!fotoUrl) {
        fotoUrl = null;
      }

      await updateProfile(user, {
        displayName: nome,
        photoURL: fotoUrl,
      });

      await updateDoc(doc(db, 'users', user.uid), {
        nome,
        bio,
        foto: fotoUrl,
      });

      Swal.fire({
        title: 'Perfil atualizado!',
        text: 'Suas informações foram atualizadas com sucesso.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      navigation.goBack();
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: error.message || 'Não foi possível atualizar o perfil.',
        icon: 'error',
        confirmButtonText: 'Tentar novamente',
      });
    } finally {
      setLoading(false);
    }
  };



  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Swal.fire({
        title: 'Permissão negada',
        text: 'Precisamos de permissão para acessar suas fotos!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri); // isso aqui é importante: `result.assets[0].uri`
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Perfil</Text>

      <TouchableOpacity onPress={handlePickImage} style={styles.fotoPerfilContainer}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.fotoPerfil} />
        ) : (
          <Text style={styles.textoFoto}>Escolha uma foto</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#999"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Bio"
        placeholderTextColor="#999"
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity style={styles.botao} onPress={handleUpdateProfile}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.textoBotao}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar</Text>
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
    backgroundColor: '#fff', // Botão branco
    padding: 12,
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
    color: '#fff', // Texto branco
    textDecorationLine: 'underline',
  },
  fotoPerfilContainer: {
    backgroundColor: '#fff', // Fundo branco
    borderRadius: 75,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  textoFoto: {
    color: '#000', // Texto preto
    fontSize: 14,
  },
});
