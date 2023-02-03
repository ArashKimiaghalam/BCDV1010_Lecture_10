const MetaCoin = artifacts.require("MetaCoin");

contract("MetaCoin", (accounts) => {
    // 1
    it("should put 10000 MetaCoin in the first account", async () => {
        const metaCoinInstance = await MetaCoin.deployed();
        const balance = await metaCoinInstance.getBalance.call(accounts[0]);

        assert.equal(
            balance.valueOf(),
            10000,
            "10000 wasn't in the first account"
        );
    });

    // 2
    it("should call a function that depends on a linked library", async () => {
        const metaCoinInstance = await MetaCoin.deployed();
        const metaCoinBalance = (
            await metaCoinInstance.getBalance.call(accounts[0])
        ).toNumber();
        const metaCoinEthBalance = (
            await metaCoinInstance.getBalanceInEth.call(accounts[0])
        ).toNumber();

        assert.equal(
            metaCoinEthBalance,
            2 * metaCoinBalance,
            "Library function returned unexpected function, linkage may be broken"
        );
    });

    // 3
    it("should send coin correctly", async () => {
        const metaCoinInstance = await MetaCoin.deployed();

        // Setup 2 accounts.
        const accountOne = accounts[0];
        const accountTwo = accounts[1];

        // Get initial balances of first and second account.
        const accountOneStartingBalance = (
            await metaCoinInstance.getBalance.call(accountOne)
        ).toNumber();
        const accountTwoStartingBalance = (
            await metaCoinInstance.getBalance.call(accountTwo)
        ).toNumber();

        // Make transaction from first account to second.
        const amount = 10;
        await metaCoinInstance.sendCoin(accountTwo, amount, {
            from: accountOne,
        });

        // Get balances of first and second account after the transactions.
        const accountOneEndingBalance = (
            await metaCoinInstance.getBalance.call(accountOne)
        ).toNumber();
        const accountTwoEndingBalance = (
            await metaCoinInstance.getBalance.call(accountTwo)
        ).toNumber();

        assert.equal(
            accountOneEndingBalance,
            accountOneStartingBalance - amount,
            "Amount wasn't correctly taken from the sender"
        );
        assert.equal(
            accountTwoEndingBalance,
            accountTwoStartingBalance + amount,
            "Amount wasn't correctly sent to the receiver"
        );
    });

    // 4
    it("should emit a Transfer event on successful coin transfer", async () => {
        const metaCoinInstance = await MetaCoin.deployed();
        const accountOne = accounts[0];
        const accountTwo = accounts[1];

        const amount = 10;
        const transaction = await metaCoinInstance.sendCoin(
            accountTwo,
            amount,
            { from: accountOne }
        );

        assert.equal(
            transaction.logs.length,
            1,
            "Transfer event should have been emitted"
        );
        assert.equal(
            transaction.logs[0].event,
            "Transfer",
            "Transfer event should be named Transfer"
        );
        assert.equal(
            transaction.logs[0].args._from,
            accountOne,
            "Transfer event should have correct _from address"
        );
        assert.equal(
            transaction.logs[0].args._to,
            accountTwo,
            "Transfer event should have correct _to address"
        );
        assert.equal(
            transaction.logs[0].args._value,
            amount,
            "Transfer event should have correct _value"
        );
    });

    // 5
    it("should return false when attempting to send more coins than available", async () => {
        const metaCoinInstance = await MetaCoin.deployed();

        // Get initial balances of first account.
        const accountOneStartingBalance = (
            await metaCoinInstance.getBalance.call(accounts[0])
        ).toNumber();

        // Attempt to send more coins than available
        const amount = accountOneStartingBalance + 1;

        try {
            await metaCoinInstance.sendCoin(accounts[1], amount, {
                from: accounts[0],
            });
            assert.fail("Expected transaction to fail with an exception");
        } catch (error) {
            // Check the error message to see if the exception was thrown because of the insufficient funds
            assert(
                error.message.includes("revert"),
                `Expected "revert", but got ${error.message}`
            );
        }

        const accountOneEndingBalance = (
            await metaCoinInstance.getBalance.call(accounts[0])
        ).toNumber();

        assert.equal(
            accountOneStartingBalance,
            accountOneEndingBalance,
            "Balance changed unexpectedly"
        );
    });
    
    // 6 it is new test for sake of the test. Here we try to test the total supply that is availabe in the contract.
    
    it("should return the total supply of coins", async () => {
        const metaCoinInstance = await MetaCoin.deployed();
        const totalSupply = (await metaCoinInstance.totalSupply.call()).toNumber();

        assert.equal(totalSupply, 100000, "Total supply is incorrect");
    });
});
