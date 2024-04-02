import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import { expect } from "chai";
import { BN } from "bn.js";
import { initWalletWithSols, mintANftForWallet } from "./helper";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("marketplace", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const aliceAccount = provider.wallet as anchor.Wallet;

  anchor.setProvider(provider);

  const program = anchor.workspace.Marketplace as Program<Marketplace>;

  const [masterAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("master_account_")],
    program.programId
  );

  it("init_master", async () => {
    const tx = await program.methods
      .initMaster(3)
      .accounts({
        signer: aliceAccount.publicKey,
        masterAccount: masterAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([aliceAccount.payer])
      .rpc();

    console.log("signature: ", tx);

    const master = await program.account.master.fetch(masterAccount);

    expect(master.initialized).equal(true);
    expect(master.marketFee).equal(3);
    expect(master.authority.toBase58()).equal(
      aliceAccount.publicKey.toBase58()
    );
  });

  it("list", async () => {
    // create token mint
    const { tokenMint, tokenAccount } = await mintANftForWallet(
      aliceAccount.payer,
      provider.connection
    );

    const [listingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("listing_account_"), tokenMint.toBuffer()],
      program.programId
    );

    const [marketTokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_token_account_"), tokenMint.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .list(new BN(10))
      .accounts({
        listingAccount,
        marketTokenAccount,
        seller: aliceAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenMint,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        userTokenAccount: tokenAccount.address,
      })
      .signers([aliceAccount.payer])
      .rpc();

    const listing = await program.account.listing.fetch(listingAccount);

    expect(listing.price.toNumber()).equal(10);
    expect(listing.seller.toBase58()).equal(aliceAccount.publicKey.toBase58());
    expect(listing.tokenMint.toBase58()).equal(tokenMint.toBase58());

    console.log("signature: ", tx);
  });

  it("buy", async () => {
    const seller = await initWalletWithSols(10, provider.connection);
    const buyer = await initWalletWithSols(10, provider.connection);

    const { tokenAccount, tokenMint } = await mintANftForWallet(
      seller,
      provider.connection
    );

    const [listingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("listing_account_"), tokenMint.toBuffer()],
      program.programId
    );

    const [marketTokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_token_account_"), tokenMint.toBuffer()],
      program.programId
    );

    await program.methods
      .list(new BN(6 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        listingAccount,
        marketTokenAccount,
        seller: seller.publicKey,
        tokenMint,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        userTokenAccount: tokenAccount.address,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    const userTokenAccount = await spl.getOrCreateAssociatedTokenAccount(
      provider.connection,
      buyer,
      tokenMint,
      buyer.publicKey
    );

    const tx = await program.methods
      .buy()
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        listingAccount,
        marketTokenAccount,
        userTokenAccount: userTokenAccount.address,
        tokenMint,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    expect(
      await provider.connection.getBalance(
        new anchor.web3.PublicKey(listingAccount.toBuffer())
      )
    ).equal(0);

    expect(
      (
        await spl.getAccount(provider.connection, userTokenAccount.address)
      ).amount.toString()
    ).equal("1");

    console.log("signature: ", tx);
  });
});
