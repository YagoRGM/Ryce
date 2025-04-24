import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, FlatList, Image, Alert } from 'react-native';
import { db } from '../config/FireBaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';


export default function Inicio({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      const postsList = [];
      querySnapshot.forEach((doc) => {
        postsList.push({ id: doc.id, ...doc.data() });
      });

      setPosts(postsList);
    } catch (error) {
      console.log('Erro ao buscar postagens:', error);
      alert('Erro, Não foi possível carregar as postagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item: post }) => {
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        easing="ease-out"
        iterationCount={1}
      >
        <TouchableOpacity
          key={post.id}
          style={styles.postContainer}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Detalhes', { post })}
        >
          <View style={styles.postHeader}>
            {post.userPhoto ? (
              <Image source={{ uri: post.userPhoto }} style={styles.userImage} />
            ) : (
              <View style={styles.userImage} />
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.nome}</Text>
              <Text style={styles.postDate}>{new Date(post.timestamp?.seconds * 1000).toLocaleString()}</Text>
            </View>
          </View>

          <Text style={styles.postText} numberOfLines={3}>
            {post.texto}
          </Text>


          {post.imagemUrl && <Image source={{ uri: post.imagemUrl }} style={styles.postImage} />}

          <Animatable.View
            animation="pulse"
            iterationCount={1}
            duration={400}
          >
            <TouchableOpacity
              style={[styles.likeButton, { backgroundColor: '#fff' }]} // Cor ciano
              onPress={() => navigation.navigate('Detalhes', { post })} // Navega para DetalhesPost
            >
              <Text style={styles.likeButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Para você</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Mensagens')}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Post')} style={styles.createPostButton}>
        <Text style={styles.createPostText}>Criar Publicação</Text>
      </TouchableOpacity>

      <Pressable
        onPress={() => navigation.navigate('Post')}
        style={({ hovered }) => [
          styles.plusButton,
          hovered && styles.plusButtonHover
        ]}
      >
        <Ionicons name="add-outline" size={34} color="black" />
      </Pressable>

      {loading ? (
        <Text style={styles.loadingText}>Carregando postagens...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsList}
        />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginBottom: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#fff',
  },
  text: {
    fontSize: 18,
    margin: 20,
  },
  createPostButton: {
    backgroundColor: '#fff', // Botão branco
    zIndex: 5,
    bottom: 20,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  createPostText: {
    color: '#000', // Texto preto
    fontSize: 16,
  },
  plusButton: {
    position: 'absolute',
    zIndex: 5,
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#fff', // Botão branco
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    transitionDuration: '150ms', // Suaviza o hover
  },
  plusButtonHover: {
    transform: [{ scale: 1.15 }],
  },
  plusText: {
    color: '#000', // Ícone preto
    fontSize: 30,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  postsList: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#1c1c1c',
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    alignSelf: 'center',
    width: '180%',
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#aaa',
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDate: {
    color: '#ccc',
    fontSize: 12,
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    maxWidth: '100%',
    maxHeight: 72,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  likeButton: {
    backgroundColor: '#fff', // Botão branco
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  likeButtonText: {
    color: '#000', // Texto preto
    fontSize: 16,
  },
  logo: {
    width: 44, // Ajustado para o mesmo tamanho do ícone
    height: 32, // Proporcional ao tamanho original da imagem
  },
});
