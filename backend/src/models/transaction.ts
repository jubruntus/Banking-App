import { Entity, Model } from "dynamodb-onetable";
import { Schema } from "./schema";
import { table } from "../db/connectDB";

type Transaction = Entity<typeof Schema.models.Transaction>;
const TransactionModel: Model<Transaction> =
  table.getModel<Transaction>("Transaction");

export { TransactionModel };
