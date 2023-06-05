import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import * as BankAPI from "../network/BankAPI";
import { Credentials } from "../network/BankAPI";
import stylesUtils from "../styles/utils.module.css";
import TextInputField from "./form/TextInputField";

interface CloseAccountModalProps {
  onDismiss: () => void;
  onLogoutSuccessful: () => void;
}

const CloseAccountModal = ({
  onDismiss,
  onLogoutSuccessful,
}: CloseAccountModalProps) => {
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>();
  async function onSubmit(credentials: Credentials) {
    try {
      const user = await BankAPI.login(credentials);
      if (user) {
        const closed = await BankAPI.closeAccount();
        await BankAPI.logout();
        alert(closed);
        onLogoutSuccessful();
      }
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
        <Modal.Title>Close Account</Modal.Title>
      </Modal.Header>
      {errorText && <Alert variant="danger">{errorText}</Alert>}
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Label>
            Enter your username and password to withdraw your remaining funds
            and permanently close your account.
          </Form.Label>
          <TextInputField
            name="username"
            label="Username"
            type="text"
            placeholder="Username"
            register={register}
            registerOptions={{ required: "Required" }}
            error={errors.username}
          />
          <TextInputField
            name="password"
            label="Password"
            type="password"
            placeholder="Password"
            register={register}
            registerOptions={{ required: "Required" }}
            error={errors.password}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className={stylesUtils.width100}
          >
            Close Account
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
export default CloseAccountModal;
