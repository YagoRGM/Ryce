import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Swal from 'sweetalert2';

export default function Perfil() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            foto: userData.foto || currentUser.photoURL,
            bio: userData.bio || '',
          });
        } else {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            foto: currentUser.photoURL,
            bio: '',
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Swal.fire({
          title: 'Até logo!',
          text: 'Você saiu da sua conta com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          navigation.replace('Login');
        });
      })
      .catch((error) => {
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um erro ao tentar deslogar!',
          icon: 'error',
          confirmButtonText: 'Tentar Novamente',
        });
      });
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user.foto }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {user.displayName || 'Usuário'}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userBio}>{user.bio || 'Sem biografia.'}</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('EditarPerfil')} style={styles.editProfileButton}>
        <Text style={styles.editProfileText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fundo preto
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff', // Borda branca
  },
  userName: {
    color: '#fff', // Texto branco
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#ccc', // Texto cinza claro
    marginTop: 5,
  },
  userBio: {
    color: '#aaa', // Texto cinza
    fontSize: 16,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  editProfileButton: {
    backgroundColor: '#fff', // Botão branco
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  editProfileText: {
    color: '#000', // Texto preto
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff', // Botão branco
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  logoutText: {
    color: '#000', // Texto preto
    fontSize: 16,
    fontWeight: 'bold',
  },
});
