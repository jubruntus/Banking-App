import bcrypt from "bcrypt";
const hashPassword = async (Password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(Password, salt);
};
export { hashPassword };
