import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/FireBaseConfig"; // confere se esse path tá certo

export const criarNotificacao = async ({ idPost, idUsuarioAcao, idUsuarioAlvo, nomeUsuario, tipo }) => {
    try {
        await addDoc(collection(db, "notificacoes"), {
            idPost,
            idUsuarioAcao,
            idUsuarioAlvo,
            nomeUsuario,
            tipo, // ex: "curtida" ou "comentario"
            lido: false,
            timestamp: serverTimestamp(),
        });
        console.log("✅ Notificação criada com sucesso");
    } catch (error) {
        console.error("❌ Erro ao criar notificação:", error);
    }
};
