import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventSource from 'react-native-sse';
import { generateUniqueRandomId, formatDateTime } from '../utils/Helper';
import { useNavigation } from '@react-navigation/native';
import ListEmptyComponent from '../components/ListEmptyComponent';
import ChatMessages, { Message } from '../components/ChatMessages';

const Chat = () => {
    const listRef = useRef < FlatList > (null);

    const navigation = useNavigation();

    const [userContent, setUserContent] = useState('');
    const [msgs, setMsgs] = useState < Message[] > ([]);

    const scrollPage = () => {
        listRef?.current?.scrollToEnd();
    };

    const fetchStream = () => {
        const userMsg = userContent;
        setUserContent('');
        try {
            // console.log('Starting fetching');
            const userId = generateUniqueRandomId();
            const systemId = generateUniqueRandomId();
            setMsgs(pre => [
                ...pre,
                {
                    id: userId,
                    text: userMsg,
                    createdAt: formatDateTime(new Date()),
                    creator: 'USER',
                },
                {
                    text: '',
                    id: systemId,
                    loading: true,
                    createdAt: formatDateTime(new Date()),
                    creator: 'AI',
                },
            ]);
            scrollPage();
            let url = 'http://localhost:11434/v1';
            let text = '';
            let messages = [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userMsg },
            ];
            let temperature = 0.7;
            const es = new EventSource(url + '/chat/completions', {
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: `Bearer ${OpenAIToken}`,
                },
                method: 'POST',
                // Remember to read the OpenAI API documentation to set the correct body
                body: JSON.stringify({
                    model: 'llama3',
                    messages: messages,
                    max_tokens: 600,
                    n: 1,
                    temperature: temperature,
                    stream: true,
                }),
                pollingInterval: 0, // Remember to set pollingInterval to 0 to disable reconnections
            });

            es.addEventListener('open', () => {
                // console.log('Connection opened');
                scrollPage();
                text = '';
            });
            es.addEventListener('message', (event: any) => {
                scrollPage();
                // console.log('Message received:', event.data);
                if (event.data !== '[DONE]') {
                    const data = JSON.parse(event.data);
                    if (data.choices[0].finish_reason === 'stop') {
                        // text;wh
                        setMsgs(pre =>
                            pre.map(message =>
                                message.id === systemId ? { ...message, text: text } : message,
                            ),
                        );
                        // console.log('Connection closing. Reason: Empty response.', text);
                        es.removeAllEventListeners();
                        es.close();
                        scrollPage();
                    } else {
                        if (data.choices[0].delta.content !== undefined) {
                            const delta = data.choices[0].delta.content;
                            text += delta;
                            scrollPage();
                            setMsgs(pre =>
                                pre.map(message =>
                                    message.id === systemId ? { ...message, text: text } : message,
                                ),
                            );
                        }
                    }
                } else {
                    es.removeAllEventListeners();
                    es.close();
                    scrollPage();
                    // console.log('Connection closing.', text);
                }
            });
            // console.log(text);
        } catch (error) {
            // console.log(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.container}>
                    <Text style={styles.title}>Chat</Text>
                    <FlatList
                        data={msgs}
                        contentContainerStyle={styles.listContainer}
                        renderItem={ChatMessages}
                        ListEmptyComponent={ListEmptyComponent}
                        ref={listRef}
                    />
                    <View style={styles.bottomContainer}>
                        <TextInput
                            style={styles.chatInput}
                            value={userContent}
                            onChangeText={setUserContent}
                            onSubmitEditing={() => {
                                if (userContent) {
                                    scrollPage();
                                    fetchStream();
                                }
                            }}
                        />
                        <TouchableOpacity
                            style={styles.sendBtn}
                            onPress={() => {
                                if (userContent) {
                                    scrollPage();
                                    fetchStream();
                                }
                            }}>
                            <Image
                                source={{
                                    uri: 'https://cdn-icons-png.flaticon.com/512/736/736212.png',
                                }}
                                style={styles.sendIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        navigation.goBack();
                    }}
                    style={styles.backIconBtn}>
                    <Image
                        source={{
                            uri: 'https://cdn1.iconfinder.com/data/icons/duotone-essentials/24/chevron_backward-512.png',
                        }}
                        style={styles.backIcon}
                        tintColor={'purple'}
                    />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: {
        fontSize: 16,
        color: 'purple',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        paddingVertical: 10,
    },
    bottomContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
    },
    chatInput: {
        height: 50,
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    sendIcon: { width: 20, height: 20, alignSelf: 'center', tintColor: 'purple' },
    sendBtn: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    listContainer: { paddingBottom: 25 },
    backIcon: { width: 20, height: 20 },
    backIconBtn: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
});
