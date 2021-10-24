import axios from "axios";

export const api = axios.create({
	baseURL: "http://do-while.herokuapp.com/",
});
