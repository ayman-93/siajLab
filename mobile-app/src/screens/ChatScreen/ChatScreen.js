import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Keyboard, YellowBox, Text, StyleSheet } from "react-native";

import socket from '../../utils/socket'
import MessageBubble from './components/MessageBubble';
import InputBar from './components/InputBar';
// import styles from './style';
import MenuIcon from '../../assets/images/menu.svg';
import NotificationIcon from '../../assets/images/notification.svg'

YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
])

export default ChatView = () => {
    const [messages, setMessages] = useState([]);
    const [inputBarText, setInputBarText] = useState("");
    const [keyboardOffset, setKeyboardOffset] = useState();
    // const scrollViewControl = useRef(null);



    useEffect(() => {
        socket.emit("startConversation", { userID: "userID", userSocketId: socket.id });
        socket.on("chat", _resiveMessage);
        let loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ac orci augue. Sed fringilla nec magna id hendrerit. Proin posuere, tortor ut dignissim consequat, ante nibh ultrices tellus, in facilisis nunc nibh rutrum nibh.';


        //fun keyboard stuff- we use these to get the end of the ScrollView to "follow" the top of the InputBar as the keyboard rises and falls
        Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

        // setTimeout(function () {
        //     scrollViewControl.scrollToEnd();
        // }.bind(this))

        return () => {
            Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
            Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
            socket.disconnect();
        }
    }, [])





    //When the keyboard appears, this gets the ScrollView to move the end back "up" so the last message is visible with the keyboard up
    //Without this, whatever message is the keyboard's height from the bottom will look like the last message.
    const _keyboardDidShow = (keyboardOffset) => {
        setKeyboardOffset(keyboardOffset);
        // scrollViewControl.scrollToEnd();
    }

    //When the keyboard dissapears, this gets the ScrollView to move the last message back down.
    const _keyboardDidHide = (keyboardOffset) => {
        setKeyboardOffset(keyboardOffset);
        // scrollViewControl.scrollToEnd();
    }


    useEffect(() => {
        // scrollViewControl.scrollToEnd();
    }, [messages])

    const _sendMessage = () => {
        socket.emit("chat", inputBarText);
        setMessages((prevMessages) => [...prevMessages, { direction: "right", text: inputBarText }])
        setInputBarText("");
    }

    const _resiveMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, { direction: "left", text: msg }])
    }

    const _onChangeInputBarText = (text) => {
        setInputBarText(text);
    }

    //This event fires way too often.
    //We need to move the last message up if the input bar expands due to the user's new message exceeding the height of the box.
    //We really only need to do anything when the height of the InputBar changes, but AutogrowInput can't tell us that.
    //The real solution here is probably a fork of AutogrowInput that can provide this information.
    const _onInputSizeChange = () => {
        //   setTimeout(function() {
        // scrollViewControl.scrollToEnd({ animated: false });
        //   }.bind(this))
    }

    // render() {

    const viewMessages = messages.map((message, index) => <MessageBubble key={index} direction={message.direction} text={message.text} />);

    return (
        // <View style={styles.outer}>
        <View style={styles.container}>
            <Text style={styles.title}>Chat</Text>
            <View style={styles.screenIcon}>
                <MenuIcon />
                <NotificationIcon />
            </View>
            <ScrollView style={styles.messages}>
                {viewMessages}
            </ScrollView>
            <InputBar onSendPressed={() => _sendMessage()}
                onSizeChange={() => _onInputSizeChange()}
                onChangeText={(text) => _onChangeInputBarText(text)}
                keyboardOffset={keyboardOffset}
                text={inputBarText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#EAF7F2"
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#09D189"
    },
    screenIcon: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%"
    },
    messages: {
        marginTop: 10,
        // borderWidth: 1,
        width: '90%',
    }
})