import bcrypt from "bcrypt";
import { OneTableError } from "dynamodb-onetable";
import { RequestHandler } from "express-serve-static-core";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError, UnauthenticatedError } from "../errors";
import { AccountModel, TransactionModel, UserModel, table } from "../models";
import { hashPassword } from "../util/hashPassword";

const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    // get username from session and returns associated data from dynamodb
    if (!req.session.username) {
      return res
        .status(200)
        .json({ msg: "Please log in to access your account." });
    }
    const user = await UserModel.get({ username: req.session.username });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
const createUser: RequestHandler = async (req, res, next) => {
  const username = req.body.username;
  const password = await hashPassword(req.body.password);
  const accountId = uuidv4(); // generate random id

  try {
    if (!username || !password || !accountId) {
      throw new BadRequestError("Parameters missing");
    }

    // dynamodb-onetable transaction to create a user login and an empty account
    let transaction = {};
    await UserModel.create(
      {
        username: username,
        accountId: accountId,
        password: password,
      },
      { transaction }
    );
    await AccountModel.create(
      {
        id: accountId,
        balance: 0,
      },
      { transaction }
    );
    await table.transact("write", transaction);

    // store session info
    req.session.accountId = accountId;
    req.session.username = username;

    return res.status(201).json({ username, accountId });
  } catch (error) {
    // dynamodb-onetable transaction will fail if username or accountId are not unique
    if (error instanceof OneTableError) {
      throw new BadRequestError(
        "Username is taken. Please log in or create a new account."
      );
    }
  }
};

const closeAccount: RequestHandler = async (req, res, next) => {
  try {
    // check for session variables
    if (!req.session.accountId || !req.session.username) {
      throw new BadRequestError(
        "Unable to locate user account. Please log in again."
      );
    }
    const { accountId, username } = req.session;

    // get remaining balance
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
    let remaining = getBalance.balance;

    // dynamodb-onetable transaction to withdraw funds and mark account "inactive"
    let transaction = {};
    await TransactionModel.create(
      {
        accountId: accountId,
        id: uuidv4(),
        txType: "Withdrawal",
        amount: remaining * -1,
      },
      { transaction }
    );
    await AccountModel.update(
      { id: accountId },
      { add: { balance: remaining * -1 }, transaction }
    );
    await UserModel.update(
      { username: username, accountId: accountId, active: "inactive" },
      { transaction }
    );
    let result = await table.transact("write", transaction);

    return res
      .status(200)
      .json(
        `Account deleted successfully. Your final withdrawal is $${remaining}.`
      );
  } catch (error) {
    next(error);
  }
  return;
};

const login: RequestHandler = async (req, res, next) => {
  let { username, password } = req.body;
  try {
    if (!username || !password) {
      throw new BadRequestError("Parameters missing");
    }
    // query dynamodb for user
    const findUser = await UserModel.get({
      username: username,
    });

    if (!findUser?.username) {
      throw new UnauthenticatedError("Username not found");
    }
    if (findUser?.active === "inactive") {
      throw new UnauthenticatedError("This account is no longer active");
    }

    // check for correct password with bcrypt
    let truePassword: string = findUser?.password || "";
    const passwordMatch = await bcrypt.compare(password, truePassword);
    if (!passwordMatch) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    // save user info to session
    req.session.username = username;
    req.session.accountId = findUser?.accountId;
    req.session.save(() => {
      return res.status(201).json(findUser);
    });
  } catch (error) {
    next(error);
  }
};
const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    } else {
      res.sendStatus(200);
    }
  });
};
export { createUser, login, getAuthenticatedUser, logout, closeAccount };
