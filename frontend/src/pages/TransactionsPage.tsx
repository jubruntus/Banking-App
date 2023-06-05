import { Container } from "react-bootstrap";
import styles from "../styles/transactionPage.module.css";
import BankPageLoggedInView from "../components/BankPageLoggedInViewer";
import BankPageLoggedOutView from "../components/BankPageLoggedOutViewer";
import { User } from "../models/user";

interface TransactionsPageProps {
  loggedInUser: User | null;
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const TransactionsPage = ({
  loggedInUser,
  setLoggedInUser,
}: TransactionsPageProps) => {
  return (
    <Container className={styles.transactionPage}>
      <>
        {loggedInUser ? (
          <BankPageLoggedInView
            user={loggedInUser}
            onLogoutSuccessful={() => {
              setLoggedInUser(null);
            }}
          />
        ) : (
          <BankPageLoggedOutView />
        )}
      </>
    </Container>
  );
};

export default TransactionsPage;
