const Schema = {
  name: "bank",
  version: "1.0.0",
  format: "onetable.1.0.0",
  models: {
    Account: {
      pk: {
        type: String,
        value: "account#${id}",
      },
      sk: {
        type: String,
        value: "account#${id}}",
      },
      id: {
        type: String,
        required: true,
        unique: true,
      },
      balance: {
        type: Number,
        default: 0,
      },
    },
    User: {
      pk: {
        type: String,
        value: "user#${username}",
      },
      sk: {
        type: String,
        value: "user#${accountId}",
      },
      accountId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      active: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
    },
    Transaction: {
      pk: {
        type: String,
        value: "account#${accountId}",
      },
      sk: {
        type: String,
        value: "transaction#${id}",
      },
      accountId: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
        unique: true,
      },
      txType: {
        type: String,
        required: true,
        enum: ["Deposit", "Withdrawal"],
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  } as const,
  indexes: {
    primary: {
      hash: "pk",
      sort: "sk",
    },
  },
  params: {
    isoDates: true,
    timestamps: true,
    typeField: "_type",
  },
  changed: true,
};

export { Schema };
