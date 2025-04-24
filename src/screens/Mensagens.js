import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { db } from '../config/FireBaseConfig'; // Certifique-se de que está configurado corretamente
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function Mensagens({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.uid !== uid); // Filtra o usuário logado

        setUsuarios(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
      }
    };

    fetchUsuarios();
  }, [uid]);

  const handleChatNavigation = (user) => {
    navigation.navigate('Conversa', { userId: user.uid, userName: user.nome, userPhoto: user.foto });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Usuários Cadastrados</Text>
      {usuarios.length === 0 ? (
        <Text style={styles.noUsersText}>Nenhum usuário encontrado</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.messageContainer} onPress={() => handleChatNavigation(item)}>
              <Image
                source={{ uri: item.foto || 'https://via.placeholder.com/50' }} // Foto de perfil ou imagem padrão
                style={styles.userImage}
              />
              <Text style={styles.messageText}>{item.nome}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // fundo escuro
    padding: 20,
  },
  text: {
    color: '#09b391',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noUsersText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
  },
});
