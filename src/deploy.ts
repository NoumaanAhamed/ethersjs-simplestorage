import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

//* Initialse test address and wallet using ganache

// interface SimpleStorage {
//   retrieve(): Promise<ethers.BigNumberish>;
//   store(favoriteNumber: ethers.BigNumberish): Promise<ethers.ContractTransaction>;
// }

async function main() {
  // read-only connection to the blockchain (no private key)
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);

  //? ----------------------------------------------------------------

  //* Encrypted JSON Key instead of private key (for security)
  //* Generate encrypted key using encryptKey.js
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8");

  // const wallet = await ethers.Wallet.fromEncryptedJson(
  //   encryptedJson,
  //   process.env.PASSWORD,
  // );

  // const signer = wallet.connect(provider);

  //?                 (or)

  // read-write connection to the blockchain (has private key)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  //? ----------------------------------------------------------------

  const address = await signer.getAddress();

  const balance = await provider.getBalance(address);

  console.log("Balance: ", ethers.formatEther(balance));

  //? ----------------------------------------------------------------

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const bin = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8");

  //? ----------------------------------------------------------------

  //* used for deploying a new contract

  const contractFactory = new ethers.ContractFactory(abi, bin, signer);

  // a program which has been deployed to the blockchain
  const contract = await contractFactory.deploy();

  console.log("Deploying, please wait...");

  //after deployment, we get the transaction receipt
  const receipt = await contract.deploymentTransaction()!.wait();

  const deployedContractAddress = receipt!.contractAddress;

  console.log("Deployed Contract Address: ", deployedContractAddress);

  //? ----------------------------------------------------------------

  //* no autocomplete for contract methods as it is a generic contract
  //* we need to specify the contract interface (abi)

  // @ts-ignore
  let currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number: ${currentFavoriteNumber}`);
  console.log("Updating favorite number to 7...");
  // @ts-ignore
  let transactionResponse = await contract.store(7);

  await transactionResponse.wait();
  // console.log("Transaction Response: ", transactionResponse);

  console.log("Retrieving new favorite number...");

  // @ts-ignore
  currentFavoriteNumber = await contract.retrieve();
  console.log(`New Favorite Number 1: ${currentFavoriteNumber}`);

  console.log("Deploying an instance from existing contract...");

  //* used for already deployed contracts

  //* const newContractWithProvider = new ethers.Contract(
  //   deployedContractAddress,
  //   abi,
  //   provider
  // );

  const newContractWithSigner = new ethers.Contract(
    deployedContractAddress!,
    abi,
    signer,
  );

  //* Won't work because we don't have the private key for the contract
  // only allows view and pure functions

  //! transactionResponse = await newContractWithSigner.store(8);

  //* will work as we've signed the transaction
  // (but wont work in this case as we already have a contract deployed)
  //! nonce error => transaction count will change

  //! console.log("Updating favorite number to 8...");

  //! transactionResponse = await newContractWithSigner.store(8);

  console.log("Retrieving new favorite number from new contract ");
  // Note that the favorite number is updated to 7

  currentFavoriteNumber = await newContractWithSigner.retrieve();
  console.log(`New Favorite Number 2: ${currentFavoriteNumber}`);

  //? ----------------------------------------------------------------

  //* Gets default address from provider of index 0 (In case of metamask)

  // const signer = await provider.getSigner();
  // console.log(await signer.getAddress());

  //? ----------------------------------------------------------------

  // const transaction = await signer.sendTransaction({
  //   to: "0xdb7cFDaf3dfe8381197b356eAFc91549048dd086",
  //   value: ethers.parseEther("1.0"),
  // });

  // const receipt = await transaction.wait();
  // console.log(receipt);

  //? ----------------------------------------------------------------

  console.log(
    "Final Balance: ",
    ethers.formatEther(await provider.getBalance(address)),
  );

  const txCount = await provider.getTransactionCount(address);

  console.log("Transaction Count: ", txCount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  