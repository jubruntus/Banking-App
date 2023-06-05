import { Transaction } from "../models/transaction";
import { User } from "../models/user";

async function FetchData(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.ok) {
    return response;
  } else {
    const errorBody = await response.json();
    const errorMessage = errorBody.msg;
    throw Error(errorMessage);
  }
}
export async function FetchTransactions(): Promise<Transaction[]> {
  const response = await FetchData("api/transactions", {
    method: "GET",
    credentials: "include",
  });
  return response.json();
}
export interface TransactionInput {
  amount: number;
  txType: string;
}
export async function createTransaction(transaction: TransactionInput) {
  const response = await FetchData("api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(transaction),
  });

  return response.json();
}
export async function getLoggedInUser(): Promise<User> {
  const response = await FetchData("api/account", {
    method: "GET",
    credentials: "include",
  });
  return response.json();
}
export interface Credentials {
  username: string;
  password: string;
}
export async function signUp(credentials: Credentials): Promise<User> {
  const response = await FetchData("api/account/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
}
export async function login(credentials: Credentials) {
  const response = await FetchData("api/account/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  return response.json();
}
export async function logout() {
  await FetchData("api/account/logout", {
    method: "POST",
  });
}
export async function closeAccount() {
  const response = await FetchData("api/account", {
    method: "DELETE",
    credentials: "include",
  });
  return response.json();
}
