const test = require("unit.js");
const DatabaseConnection = require("../../model/databaseConnection");
const dbConnection = new DatabaseConnection();
let User = null;

describe("User class test",() => {
    before(async () => {
       await dbConnection.connect();
       User = require("../../model/user")(dbConnection.connection);
    });

    it("Should create a new user ", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(null,username,password);
       user.username.must.be(username);
       user.password.must.be(password);
       done();
    });

    it("Should hash a password",(done)=>{
       const passwordToHash = "password";
       User.hashPassword(passwordToHash).then((hash) => {
           test.must(hash).not.be.empty();
           done();
       }).catch((error)=>{
           console.log(error);
       })
    });

    it("Should save password hash", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(null,username,null);
       user.username.must.be(username);

       user.setPlainPassword(password).then((hash)=> {
           hash.must.not.be(false);
           hash.must.not.be.empty();
           done();
       });
    });

    it("Should compare hash correctly", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(null,username,null);
       user.username.must.be(username);

       user.setPlainPassword(password).then((hash) => {
           hash.must.not.be(false);
           hash.must.not.be.empty();

           user.isPasswordValid(password).then((valid) => {
               valid.must.be.true();
               done();
           });
       });
    });

    it("Should throw an error comparing password", (done) => {
        const username = "user";
        const password = "password";

        let user = new User(null,username,password);
        user.username.must.be(username);

        user.isPasswordValid(password).catch((e)=>{
            e.must.not.be.empty();
            done();
        });
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