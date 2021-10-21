import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { io } from "socket.io-client";

import { Message, MessageProps } from "../Message";

import { styles } from "./styles";
import { api } from "../../services/api";
import { MESSAGES_EXAMPLE } from "../../../utils/messages";

const socket = io(String(api.defaults.baseURL));

const messageQueue: MessageProps[] = [];

socket.on("new_message", (message: MessageProps) => {
	if (message) messageQueue.push(message);
});

export function MessageList() {
	const [currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);
	useEffect(() => {
		setInterval(() => {
			if (messageQueue.length > 0) {
				setCurrentMessages((prevState) =>
					[messageQueue[0], prevState[0], prevState[1]].filter(Boolean),
				);
				messageQueue.shift();
			}
		}, 3000);
	}, []);
	useEffect(() => {
		async function fetchMessages() {
			const messagesResponse = await api.get<MessageProps[]>("/message/last3");
			setCurrentMessages(messagesResponse.data);
		}
		fetchMessages();
	}, []);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="never"
		>
			{currentMessages.map((message, index) => (
				<Message key={index} {...message} />
			))}
		</ScrollView>
	);
}
