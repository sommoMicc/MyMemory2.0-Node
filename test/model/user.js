var test = require("unit.js");
var User = require("../../model/user");

describe("User class test",() => {
   it("Should create a new user ", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(username,password);
       user.username.must.be(username);
       user.password.must.be(password);
       done();
   });

   it("Should save password hash", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(username,null);
       user.username.must.be(username);

       user.setPlainPassword(password,(hash) => {
           hash.must.not.be(false);
           hash.must.not.be.empty();

           done();
       });
   });

   it("Should compare hash correctly", (done) => {
       const username = "user";
       const password = "password";

       let user = new User(username,null);
       user.username.must.be(username);

       user.setPlainPassword(password,(hash) => {
           hash.must.not.be(false);
           hash.must.not.be.empty();

           user.isPasswordValid(password,(valid) => {
               valid.must.be.true();
               done();
           });
       });
   });

    it("Should throw an error comparing password", (done) => {
        const username = "user";
        const password = "password";

        let user = new User(username,password);
        user.username.must.be(username);

        user.isPasswordValid(password,(valid) => {
            valid.must.be.false();
            done();
        });
    })

});