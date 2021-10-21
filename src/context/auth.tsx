import React, { createContext, ReactNode, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID = "5efcb3d30085a119f331";
const SCOPE = "read:user";
const USER_STORAGE = "@dowhile:user";
const TOKEN_STORAGE = "@dowhile:token";

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

	async function signIn() {
		try {
			setIsSignIn(true);
			const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
			const AuthSessinResponse = (await AuthSession.startAsync({
				authUrl,
			})) as AuthorizationResponse;
			if (
				AuthSessinResponse.type === "success" &&
				AuthSessinResponse.params.error !== "access_denied"
			) {
				const authResponse = await api.post("/authenticate", {
					code: AuthSessinResponse.params.code,
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
