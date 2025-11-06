import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Pressable,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,

} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Menu, Send, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';
import { Mensaje } from '@/types';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function ChatRoomScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currentUser } = useAuth();
    const { socket } = useSocket();
    const { id: destinatarioId, nombre: destinatarioNombre } = useLocalSearchParams<{ id: string, nombre: string }>();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);


const { data: historialData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chatHistory', destinatarioId],
    queryFn: () => apiService.getHistorialChat(destinatarioId),
    enabled: !!destinatarioId,
  });

    // 2. Usar useEffect para actualizar el estado cuando 'historialData' cambia
    useEffect(() => {
    if (historialData) {
      setMensajes(historialData);
    }
  }, [historialData]);

    // 2. Escuchar mensajes nuevos
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (mensajeRecibido: Mensaje) => {
            // Solo añade el mensaje si es de este chat
            if (String(mensajeRecibido.remitente_id) === String(destinatarioId)) {
                setMensajes((prevMensajes) => [...prevMensajes, mensajeRecibido]);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [socket, destinatarioId]);

    // 3. Enviar un mensaje
    const handleSendMessage = () => {
        if (!socket || !nuevoMensaje.trim() || !currentUser) return;

        const data = {
            remitente_id: String(currentUser.id),
            destinatario_id: String(destinatarioId),
            cuerpo: nuevoMensaje.trim(),
        };

        // Emite el mensaje al servidor
        socket.emit('sendMessage', data);

        // Añade el mensaje a nuestra propia pantalla al instante
        const mensajeLocal: Mensaje = {
            ...data,
            mensaje_id: Date.now(), // ID temporal
            fecha_envio: new Date().toISOString(),
            leido: false,
        };
        setMensajes((prevMensajes) => [...prevMensajes, mensajeLocal]);

        setNuevoMensaje('');
    };

    // Auto-scroll al final
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [mensajes]);

    return (
        <View style={styles.container}>
            {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.mainContent}
            >
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    {!isWeb && (
                        <Pressable onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
                            <Menu size={24} color={Colors.industrial.text} />
                        </Pressable>
                    )}
                    {isWeb && (
                        <Pressable onPress={() => router.back()} style={styles.menuButton}>
                            <ArrowLeft size={24} color={Colors.industrial.text} />
                        </Pressable>
                    )}
                    <Text style={styles.headerTitle}>{destinatarioNombre || 'Chat'}</Text>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContentContainer}
                >
                    {isLoadingHistory && <Text style={styles.loadingText}>Cargando historial...</Text>}
                    {mensajes.map((msg) => {
                        const isMyMessage = String(msg.remitente_id) === String(currentUser?.id);
                        return (
                            <View
                                key={msg.mensaje_id}
                                style={[
                                    styles.messageBubble,
                                    isMyMessage ? styles.myMessage : styles.theirMessage
                                ]}
                            >
                                <Text style={styles.messageText}>{msg.cuerpo}</Text>
                            </View>
                        );
                    })}
                </ScrollView>

                <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={Colors.industrial.textMuted}
                        value={nuevoMensaje}
                        onChangeText={setNuevoMensaje}
                        multiline
                    />
                    <Pressable style={styles.sendButton} onPress={handleSendMessage}>
                        <Send size={24} color={Colors.industrial.text} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.industrial.background,
        flexDirection: isWeb ? 'row' : 'column',
    },
    mainContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Colors.industrial.backgroundSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.industrial.border,
    },
    menuButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.industrial.text,
        flex: 1,
    },
    chatContainer: {
        flex: 1,
    },
    chatContentContainer: {
        padding: 16,
    },
    loadingText: {
        color: Colors.industrial.textSecondary,
        textAlign: 'center',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: Colors.industrial.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        backgroundColor: Colors.industrial.surface,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 15,
        color: Colors.industrial.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        backgroundColor: Colors.industrial.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.industrial.border,
        gap: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.industrial.surface,
        borderWidth: 1,
        borderColor: Colors.industrial.border,
        borderRadius: 20,
        padding: 12,
        paddingTop: 12, // Asegura padding en multiline
        fontSize: 15,
        color: Colors.industrial.text,
        maxHeight: 120, // Evita que crezca indefinidamente
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.industrial.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});