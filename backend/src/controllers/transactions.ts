import { RequestHandler } from "express-serve-static-core";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError } from "../errors/bad-request";
import { AccountModel, TransactionModel, table } from "../models";

const createTransaction: RequestHandler = async (req, res, next) => {
  // clean up data for storage
  let amount = parseFloat(req.body.amount.replace(/,/g, ""));
  const txType = req.body.txType;

  try {
    // check for account info stored in the session
    if (!req.session.accountId) {
      throw new BadRequestError(
        "Unable locate user account. Please log in again."
      );
    }
    const accountId = req.session.accountId;

    // check for appropriate variables
    if (!txType || !amount) {
      throw new BadRequestError("Input invalid.");
    }
    // check for sufficient funds in case of withdrawal
    if (txType === "Withdrawal") {
      const getBalance = await AccountModel.get({
        id: accountId,
      });
      if (
        !getBalance ||
        getBalance.balance === null ||
        getBalance.balance === undefined
      ) {
        throw new Error();
      }
      const balance = getBalance.balance;
      if (balance - amount < 0) {
        throw new BadRequestError("Insufficient funds.");
      }
      amount = amount * -1;
    }

    // dynamodb-onetable transaction to create a new banking transaction and update the account balance
    let transaction = {};
    await TransactionModel.create(
      {
        accountId: accountId,
        id: uuidv4(),
        txType: txType,
        amount: amount,
      },
      { transaction }
    );
    await AccountModel.update(
      { id: accountId },
      { add: { balance: amount }, transaction }
    );
    let result = await table.transact("write", transaction);

    return res.status(200).json({ txType, amount });
  } catch (error) {
    next(error);
  }
};
const getTransactions: RequestHandler = async (req, res, next) => {
  try {
    // check for account info stored in the session
    if (!req.session.accountId) {
      throw new BadRequestError(
        "Unable locate user account. Please log in again."
      );
    }
    // query dynamo for account info
    const transactions = await TransactionModel.find({
      accountId: req.session.accountId,
    });

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

export { createTransaction, getTransactions };
