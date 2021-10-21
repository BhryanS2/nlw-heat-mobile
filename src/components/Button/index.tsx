import React from "react";

import {
	ColorValue,
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { styles } from "./styles";

type ButtonProps = TouchableOpacityProps & {
	title: string;
	color: ColorValue;
	backgroundColor: ColorValue;
	icon?: React.ComponentProps<typeof AntDesign>["name"];
	isLoading?: boolean;
};

export function Button({
	color,
	title,
	backgroundColor,
	icon,
	isLoading = false,
	...rest
}: ButtonProps) {
	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor }]}
			{...rest}
			activeOpacity={0.7}
			disabled={isLoading}
		>
			{isLoading ? (
				<ActivityIndicator color={color} />
			) : (
				<>
					<AntDesign name={icon} size={24} style={styles.icon} />
					<Text style={[styles.title, { color }]}>{title}</Text>
				</>
			)}
		</TouchableOpacity>
	);
}
