import React, { useState } from "react";

import { Keyboard, TextInput, View } from "react-native";
import { api } from "../../services/api";
import { COLORS } from "../../theme";
import { Button } from "../Button";

import { styles } from "./styles";

export function SendMessageForm() {
	const [message, setMessage] = useState("");
	const [sendingMessage, setSendingMessage] = useState(false);

	async function handleMessageSubmit() {
		const messageFormatted = message.trim();
		if (messageFormatted.length > 0) {
			setSendingMessage(true);
			await api.post("/message", {
				message: messageFormatted,
			});
			setMessage("");
			Keyboard.dismiss();
			setSendingMessage(false);
			alert("Mensagem enviada com sucesso!");
		} else {
			alert("Escreva uma mensagem para enviar");
		}
	}

	return (
		<View style={styles.container}>
			<TextInput
				keyboardAppearance="dark"
				placeholder="Qual sua expectativa para o evento?"
				placeholderTextColor={COLORS.GRAY_PRIMARY}
				multiline
				maxLength={140}
				style={styles.input}
				value={message}
				onChangeText={setMessage}
				editable={!sendingMessage}
			/>
			<Button
				title="ENVIAR MENSSAGEM"
				backgroundColor={COLORS.PINK}
				color={COLORS.WHITE}
				onPress={handleMessageSubmit}
			/>
		</View>
	);
}
