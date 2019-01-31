const test = require("unit.js");
const DatabaseConnection = require("../../model/db/databaseConnection");
const dbConnection = new DatabaseConnection();
let User = null;

describe("User class test",() => {
    before(async () => {
       await dbConnection.connect();
       User = require("../../model/db/user")(dbConnection.connection);
    });

    it("Should create a new user ", (done) => {
       const username = "user";
       const email = "password";

       let user = new User(null,username,email);
       user.username.must.be(username);
       user.email.must.be(email);
       done();
    });

    it("Should say that user does not exists",(done)=> {
        const user = new User(null,"F_A_K_E_!_U_S_E_R",null);
        user.exists().then((result)=> {
            result.must.be.false();
            done();
        });
    });

    after(() => {
        dbConnection.terminate();
    });

});