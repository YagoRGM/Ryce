import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { db } from '../config/FireBaseConfig'; // Certifique-se de que está configurado corretamente
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function Conversa({ route }) {
  const { userId, userName, userPhoto } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef();  // Referência para o FlatList

  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  // Função para gerar um ID de conversa único entre os dois usuários
  const generateConversationId = (userId1, userId2) => {
    const ids = [userId1, userId2].sort();
    return ids.join('_');
  };

  const conversationId = generateConversationId(uid, userId);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),  // Busca mensagens baseadas no conversationId
      orderBy('timestamp', 'asc')  // Ordena as mensagens do mais antigo para o mais recente
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => doc.data());
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    // Rola para o final da lista de mensagens sempre que o estado de 'messages' mudar
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    // Cria um documento de mensagem no banco de dados
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      senderId: uid,
      receiverId: userId,
      timestamp: new Date(),
      conversationId: conversationId,  // Adiciona o ID da conversa
      users: [uid, userId],  // Define os usuários envolvidos na conversa
    });

    setNewMessage('');  // Limpar campo de texto após enviar a mensagem
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{userName}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.senderId === uid ? styles.sentMessage : styles.receivedMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView style={styles.inputContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Pressable style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
  },
  header: {
    color: '#09b391',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 15,
  },
  messageContainer: {
    backgroundColor: '#1C1C1C',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end', // Mensagens enviadas ficam à direita
  },
  receivedMessage: {
    alignSelf: 'flex-start', // Mensagens recebidas ficam à esquerda
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#121212',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: '#09b391',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },  
});
