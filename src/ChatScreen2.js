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
import { generateUniqueRandomId, formatDateTime } from './utils/Helper';
import ListEmptyComponent from './components/ListEmptyComponent';
import ChatMessages, { Message } from './components/ChatMessages';

const Chat = () => {
    const listRef = useRef(null);

    const [userContent, setUserContent] = useState('');
    const [msgs, setMsgs] = useState([]);
    //const [msgs, setMsgs] = useState < Message[] > ([]);

    const scrollPage = () => {
        listRef?.current?.scrollToEnd();
    };

    const fetchStream = () => {
        const userMsg = userContent;
        setUserContent('');
        try {
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

            let url = 'http://10.0.2.2:5000/ai_pdf';
            let text = '';
            const es = new EventSource(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    prompt: userMsg,
                }),
                lineEndingCharacter: '\n',
            });

            es.addEventListener('open', () => {
                text = '';
                scrollPage();
            });

            es.addEventListener('message', (event) => {
                scrollPage();
                if (event.data === '[DONE]') {
                    es.removeAllEventListeners();
                    es.close();
                    return;
                }

                try {
                    console.log('Checking log 1 -> ', event.data);
                    const data = JSON.parse(event.data);
                    console.log('Checking log 2 -> ', data);
                    if (data && data.content) {
                        console.log('Checking log 3 -> ', data.content);
                        text += data.content;
                        setMsgs(pre =>
                            pre.map(message =>
                                message.id === systemId ? { ...message, text: text } : message,
                            ),
                        );
                        scrollPage();
                    } else {
                        console.warn('Delta or content is undefined:', data);
                    }

                    // if (data.choices && data.choices.length > 0) {
                    //     const delta = data.choices[0].delta;
                    //     // Check if 'delta' and 'content' exist

                    // } else {
                    //     console.warn('Choices array is empty or undefined:', data.choices);
                    // }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });

            es.addEventListener('error', (error) => {
                console.error('Error in EventSource:', error);
                es.close();
            });

        } catch (error) {
            console.error('Error in fetchStream:', error);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                // keyboardVerticalOffset={Platform.OS === 'android' ? 57 : 0}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.container}>
                    <Text style={styles.title}>Ortho ChatBot</Text>
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
                {/* <TouchableOpacity
                    onPress={() => {
                        // navigation.goBack();
                    }}
                    style={styles.backIconBtn}>
                    <Image
                        source={{
                            uri: 'https://cdn1.iconfinder.com/data/icons/duotone-essentials/24/chevron_backward-512.png',
                        }}
                        style={styles.backIcon}
                        tintColor={'purple'}
                    />
                </TouchableOpacity> */}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: {
        fontSize: 23,
        color: 'purple',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        paddingVertical: 10,
    },
    bottomContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 10
    },
    chatInput: {
        height: 50,
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: 'purple'
    },
    sendIcon: { width: 20, height: 20, alignSelf: 'center', tintColor: 'white' },
    sendBtn: {
        backgroundColor: 'purple',
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
