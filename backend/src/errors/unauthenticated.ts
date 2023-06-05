import { CustomAPIError } from "./custom-api";
import { StatusCodes } from "http-status-codes";
class UnauthenticatedError extends CustomAPIError {
  statusCode: StatusCodes;
  constructor(message: any) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
export { UnauthenticatedError };
