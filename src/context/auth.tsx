import React, { createContext, ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

import { api } from "../services/api";

const SCOPE = "read:user";
const USER_STORAGE = "@dowhile:user";
const TOKEN_STORAGE = "@dowhile:token";
const CLIENT_ID = "NWVmY2IzZDMwMDg1YTExOWYzMzE=";
const CLIENT_SECRET =
	"NDI4ZjQ2N2Y1ODMxMWNkNzJhMWEwY2QyNGNmZDA2MWU5Y2U3OTY4Mg==";

type User = {
	id: string;
	avatar_url: string;
	name: string;
	login: string;
};

type AuthContextData = {
	user: User | null;
	isSignIn: boolean;
	signIn(): Promise<void>;
	signOut(): Promise<void>;
};

type AuthProviderProps = {
	children: ReactNode;
};

type AuthResponse = {
	token: string;
	user: User;
};

type AuthorizationResponse = {
	params: {
		code?: string;
		error?: string;
	};
	type?: string;
};

export const authContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isSignIn, setIsSignIn] = useState(false);
	function base64Decode(input: string) {
		let output = "";
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		let keyStr =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		do {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = "";
		} while (i < input.length);

		return output;
	}

	async function signIn() {
		try {
			setIsSignIn(true);
			const authUrl = `https://github.com/login/oauth/authorize?client_id=${base64Decode(
				CLIENT_ID,
			)}&scope=${SCOPE}`;
			const AuthSessinResponse = (await AuthSession.startAsync({
				authUrl,
			})) as AuthorizationResponse;
			if (
				AuthSessinResponse.type === "success" &&
				AuthSessinResponse.params.error !== "access_denied"
			) {
				const authResponse = await api.post("/authenticate", {
					code: AuthSessinResponse.params.code,
					client: base64Decode(CLIENT_ID),
					secret: base64Decode(CLIENT_SECRET),
				});
				const { token, user } = authResponse.data as AuthResponse;
				api.defaults.headers.common.authorization = `Bearer ${token}`;
				await AsyncStorage.setItem(TOKEN_STORAGE, token);
				await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
				setUser(user);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsSignIn(false);
		}
	}
	async function signOut() {
		setUser(null);
		await AsyncStorage.removeItem(TOKEN_STORAGE);
		await AsyncStorage.removeItem(USER_STORAGE);
	}

	useEffect(() => {
		async function loadStorageData() {
			const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);
			const userStorage = await AsyncStorage.getItem(USER_STORAGE);
			if (tokenStorage && userStorage) {
				api.defaults.headers.common.authorization = `Bearer ${tokenStorage}`;
				setUser(JSON.parse(userStorage));
			}
			setIsSignIn(false);
		}
		loadStorageData();
	}, []);
	return (
		<authContext.Provider value={{ user, isSignIn, signIn, signOut }}>
			{children}
		</authContext.Provider>
	);
}
