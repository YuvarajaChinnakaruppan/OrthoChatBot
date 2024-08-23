import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Keyboard, TouchableOpacity } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import axios from 'axios';
import FastImage from "react-native-fast-image";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (newMessages = []) => {
        Keyboard.dismiss();
        setMessages(GiftedChat.append(messages, newMessages));
        const userMessage = newMessages[0].text;
        setLoading(true);

        try {
            const response = await axios.post('http://10.0.2.2:5000/ask_pdf', {  // Update with your correct URL
                query: userMessage,
                variables: {}
            });

            const botMessage = {
                _id: Math.random().toString(36).substring(7),
                text: response.data.Response,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'OrthoBot',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            };

            setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage));
        } catch (error) {
            console.error('Error fetching response from API:', error);
            const errorMessage = {
                _id: Math.random().toString(36).substring(7),
                text: 'Sorry, something went wrong. Please try again later.',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'OrthoBot',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            };
            setMessages(previousMessages => GiftedChat.append(previousMessages, errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const renderInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    borderTopWidth: 1,
                    borderTopColor: '#ddd',
                    backgroundColor: '#f9f9f9',
                    padding: 8,
                    borderRadius: 25,
                    marginHorizontal: 10,
                    marginBottom: 0,
                    backgroundColor: 'rgba(1, 117, 117, 0.3)',
                }}
                primaryStyle={{ alignItems: 'center' }}
            />
        );
    };

    const renderSend = (props) => {
        return (
            <Send {...props}>
                <View style={{ marginRight: 10, marginBottom: 10, backgroundColor: "red" }}>
                    <Icon name="send" size={32} color="#008080" />
                </View>
            </Send>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FastImage
                    style={{
                        width: 40,
                        height: 40,
                    }}
                    source={require('../assets/ortho-logo.jpg')}
                    resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.title}>OrthoChatBot</Text>
            </View>
            <GiftedChat
                messages={messages}
                onSend={newMessages => handleSend(newMessages)}
                user={{
                    _id: 1,
                }}
                renderBubble={props => (
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            right: {
                                backgroundColor: '#008080',
                            },
                            left: {
                                backgroundColor: '#e1e1e1',
                            },
                        }}
                        textStyle={{
                            right: {
                                color: '#fff',
                                fontSize: 17,
                            },
                        }}
                    />
                )}
                renderInputToolbar={props => renderInputToolbar(props)}
                renderSend={props => renderSend(props)}
            />
            {loading && (
                <TouchableOpacity
                    style={styles.loadingContainer}
                    activeOpacity={1}
                    onPress={() => { }}
                >
                    <FastImage
                        style={styles.loadingGif}
                        source={require('../assets/chat_bot.gif')}
                        resizeMode={FastImage.resizeMode.contain}
                    />
                </TouchableOpacity>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#008080',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    logo: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Optional: Adds a dimmed background effect
        zIndex: 999,
    },
    loadingGif: {
        width: 100,
        height: 100,
    },
});
