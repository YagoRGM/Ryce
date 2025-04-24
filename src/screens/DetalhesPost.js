import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { db } from '../config/FireBaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot, addDoc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { criarNotificacao } from "../utils/criarNotificacao";

export default function DetalhesPost() {
    const navigation = useNavigation();
    const route = useRoute();
    const { post } = route.params;
    const [likes, setLikes] = useState(post.likes || []);
    const [comentario, setComentario] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const auth = getAuth();
    const usuarioAtual = auth.currentUser;

    const [nome, setNome] = useState('');  // Nome do usuário logado
    const [loading, setLoading] = useState(true); // Para mostrar carregando enquanto busca os dados

    useEffect(() => {
        const fetchUserName = async () => {
            const user = getAuth().currentUser; // Pegando o usuário logado
            if (user) {
                try {
                    // Buscando dados do usuário no Firestore
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setNome(userDoc.data().nome); // Salvando o nome no estado
                    } else {
                        console.log('Documento do usuário não encontrado!');
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                } finally {
                    setLoading(false); // Parando o carregamento
                }
            } else {
                console.log('Usuário não logado');
                setLoading(false); // Parando o carregamento se o usuário não estiver logado
            }
        };

        fetchUserName();
    }, []); // Executa apenas uma vez, quando a tela é carregada

    // Monitorar curtidas em tempo real
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'posts', post.id), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLikes(data.likes || []);
            }
        });
        return () => unsubscribe();
    }, [post.id]);

    // Buscar comentários em tempo real
    useEffect(() => {
        if (!post?.id) return;

        const comentariosRef = collection(db, 'posts', post.id, 'comentarios');
        const q = query(comentariosRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComentarios(lista);
        });

        return () => unsubscribe();
    }, [post?.id]);

    // CURTIR
    const [curtiu, setCurtiu] = useState(false);

    useEffect(() => {
        const verificarCurtida = async () => {
            const auth = getAuth();
            const usuario = auth.currentUser;
            if (!usuario) return;

            const postRef = doc(db, "posts", post.id);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                if (postData?.curtidas?.includes(usuario.uid)) {
                    setCurtiu(true);
                }
            }
        };

        verificarCurtida();
    }, []); // Verifica se já curtiu

    const handleCurtir = async () => {
        const auth = getAuth();
        const usuario = auth.currentUser;
    
        if (!usuario || curtiu) return;
    
        const postRef = doc(db, "posts", post.id);
        const postSnap = await getDoc(postRef);
    
        if (postSnap.exists()) {
            const postData = postSnap.data();
    
            await updateDoc(postRef, {
                curtidas: arrayUnion(usuario.uid),
            });
    
            await criarNotificacao({
                idPost: post.id,
                idUsuarioAcao: usuario.uid,
                idUsuarioAlvo: postData.uid,
                nomeUsuario: nome || "Usuário", // Passando o nome do usuário logado
                tipo: "curtida",
            });
    
            setCurtiu(true);
        }
    };
    
    const handleComentar = async () => {
        const auth = getAuth();
        const usuario = auth.currentUser;
    
        if (!comentario.trim()) return;
    
        try {
            await addDoc(collection(db, "posts", post.id, "comentarios"), {
                texto: comentario,
                uid: usuario.uid,
                nome: nome || "Usuário", // Passando o nome do usuário logado
                foto: usuario.photoURL || "",
                timestamp: serverTimestamp(),
            });
    
            const postRef = doc(db, "posts", post.id);
            const postSnap = await getDoc(postRef);
            const postData = postSnap.data();
    
            if (usuario.uid !== postData.uid) {
                await criarNotificacao({
                    idPost: post.id,
                    idUsuarioAcao: usuario.uid,
                    idUsuarioAlvo: postData.uid,
                    nomeUsuario: nome || "Usuário", // Passando o nome do usuário logado
                    tipo: "comentario",
                });
            }
    
            setComentario(""); // Limpa o campo de comentário
        } catch (error) {
            console.error("Erro ao comentar:", error);
        }
    };

    const formatarData = (timestamp) => {
        if (!timestamp) return '';
        const data = new Date(timestamp.seconds * 1000);
        return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.post}>
                <View style={styles.userInfo}>
                    {post.userPhoto && (
                        <Image source={{ uri: post.userPhoto }} style={styles.userPhoto} />
                    )}
                    <View>
                        {/* Aqui é onde você deve garantir que o nome do autor do post é exibido */}
                        <Text style={styles.userName}>{post.nome || 'Usuário'}</Text>
                        <Text style={styles.data}>{formatarData(post.timestamp)}</Text>
                    </View>
                </View>


                <Text style={styles.texto}>{post.texto}</Text>

                {post.imagemUrl ? (
                    <Image source={{ uri: post.imagemUrl }} style={styles.imagem} />
                ) : null}

                <TouchableOpacity onPress={handleCurtir}>
                    <Ionicons
                        name={curtiu ? "heart" : "heart-outline"}
                        size={24}
                        color={curtiu ? "red" : "gray"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.comentarioBox}>
                <Text style={styles.titulo}>Comentários</Text>
                <FlatList
                    data={comentarios}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.comentario}>
                            <Text style={styles.nomeComentario}>{item.nome || 'Anônimo'}:</Text> {/* Exibindo nome corretamente */}
                            <Text style={styles.textoComentario}>{item.texto}</Text>
                        </View>
                    )}
                />
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Adicionar um comentário..."
                        value={comentario}
                        onChangeText={setComentario}
                    />
                    <TouchableOpacity onPress={handleComentar} style={styles.botaoEnviar}>
                        <Text style={styles.enviarTexto}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 15,
    },
    post: {
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    data: {
        color: '#aaa',
        fontSize: 12,
    },
    texto: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    imagem: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    botaoCurtir: {
        paddingVertical: 6,
        backgroundColor: '#2e2e2e',
        borderRadius: 8,
        alignItems: 'center',
    },
    curtirTexto: {
        color: '#fff',
        fontWeight: 'bold',
    },
    comentarioBox: {
        flex: 1,
    },
    titulo: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comentario: {
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    nomeComentario: {
        color: '#fff',
        fontWeight: 'bold',
    },
    textoComentario: {
        color: '#ccc',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    botaoEnviar: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    enviarTexto: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
