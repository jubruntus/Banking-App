import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import CurrencyInput from "react-currency-input-field";
import { useForm } from "react-hook-form";
import { Transaction } from "../models/transaction";
import * as BankAPI from "../network/BankAPI";
import { TransactionInput } from "../network/BankAPI";
import styles from "../styles/transaction.module.css";

interface AddTransactionDialogProps {
  onDismiss: () => void;
  onTransactionSaved: (transaction: Transaction) => void;
}
const AddTransactionDialog = ({
  onDismiss,
  onTransactionSaved,
}: AddTransactionDialogProps) => {
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>();
  async function onSubmit(input: TransactionInput) {
    try {
      let transactionResponse: Transaction;
      transactionResponse = await BankAPI.createTransaction(input);
      onTransactionSaved(transactionResponse);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorText(error.message);
      }
      console.log(error);
    }
  }
  return (
    <Modal show onHide={onDismiss}>
      <Modal.Header closeButton>
        <Modal.Title>New Transaction</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.transactionCard}`}>
        <Form id="addTransactionForm" onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="nb-3" controlId="amount">
            <Form.Label>Amount ($)</Form.Label>
            <CurrencyInput
              placeholder="Please enter a dollar amount."
              step={1}
              allowNegativeValue={false}
              maxLength={7}
              {...register("amount", { required: "Required" })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="nb-3">
            {errorText && <Alert variant="danger">{errorText}</Alert>}
            <Form.Label> Transaction Type</Form.Label>
            <Form.Check
              type="radio"
              id="Deposit"
              label="Deposit"
              value={"Deposit"}
              {...register("txType", { required: "Required" })}
            />
            <Form.Check
              type="radio"
              id="Withdrawal"
              label="Withdrawal"
              value={"Withdrawal"}
              {...register("txType", { required: "Required" })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" form="addTransactionForm" disabled={isSubmitting}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTransactionDialog;
