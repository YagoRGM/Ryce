import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../config/FireBaseConfig";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { View, ScrollView, Text, StyleSheet } from "react-native";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "notificacoes"),
      where("idUsuarioAlvo", "==", uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const novas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotificacoes(novas);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      {notificacoes.length === 0 ? (
        <Text style={styles.noNotifications}>Nenhuma notificação</Text>
      ) : (
        notificacoes.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons
                name={n.tipo === "curtida" ? "heart-outline" : "chatbubble-ellipses-outline"}
                size={24}
                color={n.tipo === "curtida" ? "red" : "gray"}
              />
              <Text style={styles.notificationText}>
                <Text style={styles.username}>{n.nomeUsuario}</Text>{" "}
                {n.tipo === "curtida" ? "curtiu" : "comentou"} seu post
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  noNotifications: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  username: {
    fontWeight: "bold",
  },
});
