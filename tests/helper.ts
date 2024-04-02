import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";

export const initWalletWithSols = async (
  sols: number,
  connection: anchor.web3.Connection
) => {
  const wallet = anchor.web3.Keypair.generate();

  const signature = await connection.requestAirdrop(
    wallet.publicKey,
    sols * anchor.web3.LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(signature);

  return wallet;
};

export const mintANftForWallet = async (
  wallet: anchor.web3.Signer,
  connection: anchor.web3.Connection
) => {
  const tokenMint = await spl.createMint(
    connection,
    wallet,
    wallet.publicKey,
    wallet.publicKey,
    0
  );

  // associate token_mint to alice account
  const tokenAccount = await spl.getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    tokenMint,
    wallet.publicKey
  );

  await spl.mintTo(
    connection,
    wallet,
    tokenMint,
    tokenAccount.address,
    wallet,
    1
  );

  const disableMintingTx = new anchor.web3.Transaction().add(
    spl.createSetAuthorityInstruction(
      tokenMint,
      wallet.publicKey,
      spl.AuthorityType.MintTokens,
      null
    )
  );

  await anchor.web3.sendAndConfirmTransaction(connection, disableMintingTx, [
    wallet,
  ]);

  return { tokenMint, tokenAccount };
};
