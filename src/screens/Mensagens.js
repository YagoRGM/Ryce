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
      contentContainerStyle={styles.listContent}
      data={usuarios}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.messageContainer} onPress={() => handleChatNavigation(item)}>
          <Image
            source={{ uri: item.foto || 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg' }}
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
    backgroundColor: '#121212',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 30,
  },
  noUsersText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    width: '90%', // Garante uma largura consistente para centralizar
    flexDirection: 'row',
    alignSelf: 'center',
    textAlign: 'center',
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
    marginTop: 12,
  },  
});
