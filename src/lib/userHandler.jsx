import { sendHttpReq } from "./httpHandler";


export default class UserRouter {

    static login(code, password) {
        return sendHttpReq('users/login', "POST", {
            code,
            password
        }).then((response) => {
            return response.json();
        })
    }


}