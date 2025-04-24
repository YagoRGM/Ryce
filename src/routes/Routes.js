import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/FireBaseConfig'; // 👈 agora tá certo

import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import BottomTabs from './BottomTabs';  // Aqui já tem o BottomTabs
import Post from '../screens/Post';
import Comentarios from '../screens/Comentarios';
import EditarPerfil from '../screens/EditarPerfil';
import Mensagens from '../screens/Mensagens';
import Conversa from '../screens/Conversa';
import DetalhesPost from '../screens/DetalhesPost';

const Stack = createNativeStackNavigator();

export default function Routes() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <Splash />; // Enquanto carrega, mostra Splash
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#1C1C1C' },
                    headerTintColor: '#fff', // cor do texto do header
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            >
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={Login} options={{ headerShown: true }} />
                        <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: true }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
                        <Stack.Screen name="Post" component={Post} options={{ headerShown: true }} />
                        <Stack.Screen name="Comentarios" component={Comentarios} options={{ headerShown: true }} />
                        <Stack.Screen name="EditarPerfil" component={EditarPerfil} options={{ headerShown: true }} />
                        <Stack.Screen name="Mensagens" component={Mensagens} options={{ headerShown: true }} />
                        <Stack.Screen name="Conversa" component={Conversa} options={{ headerShown: true }} />
                        <Stack.Screen name="Detalhes" component={DetalhesPost} options={{ headerShown: true }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
