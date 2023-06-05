import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Dynamo } from "dynamodb-onetable/Dynamo";
import { Schema } from "../models/schema";
import { Table } from "dynamodb-onetable";

const Client = new Dynamo({
  client: new DynamoDBClient({ region: process.env.AWS_REGION }),
});
const table = new Table({
  client: Client,
  name: "BankOneTable",
  schema: Schema,
  partial: true,
});

export { table, Client };
