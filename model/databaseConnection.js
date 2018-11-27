export default class DatabaseConnection {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
    }

    get host() {
        return this.host;
    }

    get username() {
        return this.username;
    }

    get password() {
        return this.password;
    }
}