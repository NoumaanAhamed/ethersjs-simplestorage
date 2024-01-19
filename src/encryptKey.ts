import { ContractFactory, ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);

  const encryptedJsonKey = await wallet.encrypt(process.env.PASSWORD!);

  console.log("Encrypted JSON Key: ", encryptedJsonKey);

  fs.writeFileSync("../.encryptedKey.json", encryptedJsonKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
