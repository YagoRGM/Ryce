// Rian e Yago n28 e n31
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Swal from 'sweetalert2';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      <Text style={styles.title}>Perfil</Text>
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
        <Ionicons name="exit-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileContainer: {
    backgroundColor: '#1e1e1e',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 5,
  },
  userBio: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 15,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  editProfileButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  editProfileText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 15,
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

