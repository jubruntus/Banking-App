import { Entity, Model } from "dynamodb-onetable";
import { Schema } from "./schema";
import { table } from "../db/connectDB";

type User = Entity<typeof Schema.models.User>;
const UserModel: Model<User> = table.getModel<User>("User");

export { UserModel };
