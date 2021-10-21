import { useContext } from "react";
import { authContext } from "../context/auth";

export function useAuth() {
	const auth = useContext(authContext);
	if (!auth) throw new Error("useAuth must be used within an AuthProvider");
	return auth;
}
