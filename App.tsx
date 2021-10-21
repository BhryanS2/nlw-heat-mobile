import { StatusBar } from "expo-status-bar";
import React from "react";
import { Home } from "./src/screens/Home";

import {
	useFonts,
	Roboto_400Regular,
	Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import AppLoading from "expo-app-loading";
import { AuthProvider } from "./src/context/auth";

export default function App() {
	const [fontsLoaded] = useFonts({
		Roboto_400Regular,
		Roboto_700Bold,
	});
	1;
	if (!fontsLoaded) return <AppLoading />;
	return (
		<AuthProvider>
			<StatusBar style="light" translucent backgroundColor="transparent" />
			<Home />
		</AuthProvider>
	);
}
