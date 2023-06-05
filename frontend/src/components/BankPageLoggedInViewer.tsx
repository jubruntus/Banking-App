import { useEffect, useState } from "react";
import { Button, Card, Spinner, Stack, Table } from "react-bootstrap";
import { formatValue } from "react-currency-input-field";
import { Transaction as TransactionModel } from "../models/transaction";
import { User } from "../models/user";
import * as BankAPI from "../network/BankAPI";
import styles from "../styles/transaction.module.css";
import AddTransactionDialog from "./AddTransactionModal";
import CloseAccountModal from "./CloseAccountModal";

interface BankPageLoggedInViewProps {
  user: User;
  onLogoutSuccessful: () => void;
}
const BankPageLoggedInView = ({
  user,
  onLogoutSuccessful,
}: BankPageLoggedInViewProps) => {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [showLoadingError, setShowLoadingError] = useState(false);
  const [showAddTransactionDialog, setShowAddTransactionDialog] =
    useState(false);
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);
  useEffect(() => {
    async function loadTransactions() {
      try {
        setShowLoadingError(false);
        setTransactionLoading(true);
        const transactions = await BankAPI.FetchTransactions();
        setTransactions(transactions);
      } catch (error) {
        console.error(error);
        setShowLoadingError(true);
      } finally {
        setTransactionLoading(false);
      }
    }
    loadTransactions();
  }, []);
  const balance = () => {
    let sum = 0;
    transactions.map((transaction) => {
      sum += transaction.amount;
      return sum;
    });
    return formatValue({
      value: sum.toString(),
    });
  };

  const transactionDisplay = () => {
    const data = Array.from(transactions).sort((a, b) => {
      return Number(new Date(b.created)) - Number(new Date(a.created));
    });

    return (
      <Table hover bordered className={`${styles.transactionCard}`}>
        <thead>
          <tr>
            <th>Type </th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => {
            return (
              <tr>
                <td>{transaction.txType}</td>
                <td>
                  {formatValue({
                    value: transaction.amount.toString(),
                  })}
                </td>
                <td className="justify-content-end">{transaction.created}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <div>
        <Card className={`${styles.transactionCard}  h-100 text-center`}>
          <Card.Title>Welcome {user.username}</Card.Title>
          <Card.Text className={`${styles.cardText}`}>
            Your balance is ${balance()}
          </Card.Text>
        </Card>
      </div>
      <div className={`mx-auto`}>
        <Stack
          direction="horizontal"
          gap={3}
          className={`mx-auto justify-content-md-center`}
        >
          <div>
            <Button
              className={`mx-auto`}
              onClick={() => setShowAddTransactionDialog(true)}
            >
              New Transaction
            </Button>
          </div>
          <div>
            <Button
              className={`mx-auto`}
              onClick={() => {
                setShowCloseAccountModal(true);
              }}
            >
              Close Account
            </Button>
          </div>
        </Stack>
      </div>
      <div>
        {transactionLoading && <Spinner animation="border" variant="primary" />}
        {showLoadingError && (
          <p>Something went wrong. Please refresh the page.</p>
        )}
        {!transactionLoading && !showLoadingError && (
          <>
            {transactions.length > 0 ? (
              transactionDisplay()
            ) : (
              <p>No transactions to display.</p>
            )}
          </>
        )}
        {showAddTransactionDialog && (
          <AddTransactionDialog
            onDismiss={() => setShowAddTransactionDialog(false)}
            onTransactionSaved={(newTransaction) => {
              newTransaction.created = new Date().toISOString();
              setTransactions([newTransaction, ...transactions]);
              setShowAddTransactionDialog(false);
            }}
          />
        )}
        {showCloseAccountModal && (
          <CloseAccountModal
            onDismiss={() => setShowCloseAccountModal(false)}
            onLogoutSuccessful={onLogoutSuccessful}
          />
        )}
      </div>
    </>
  );
};
export default BankPageLoggedInView;
