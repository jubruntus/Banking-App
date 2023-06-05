import { Entity, Model } from "dynamodb-onetable";
import { Schema } from "./schema";
import { table } from "../db/connectDB";

type Account = Entity<typeof Schema.models.Account>;
const AccountModel: Model<Account> = table.getModel<Account>("Account");

export { AccountModel, Account };
