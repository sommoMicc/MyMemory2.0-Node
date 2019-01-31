const test = require("unit.js");
const DatabaseConnection = require("../../model/db/databaseConnection");

describe("Database Connection class test",() => {
    it("Should connect to database ", (done) => {
        const connection = new DatabaseConnection();
        connection.connect().then((result) => {
            result.must.be.true();
            done();
        }).catch(()=>{
            test.fail("Connessione rigettata");
            done();
        }).finally(()=>{
            connection.terminate();
        })
    });

    it("Should not connect to database", (done) => {
        const connection = new DatabaseConnection();
        connection.host = "FAKE_HOST_!";
        connection.connect().catch(()=>{
            done();
        }).finally(()=>{
            connection.terminate();
        });
    });
});