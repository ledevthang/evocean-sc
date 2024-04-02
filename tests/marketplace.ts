import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import { Marketplace } from "../target/types/marketplace";
import { expect } from "chai";
import { BN } from "bn.js";

describe("marketplace", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const aliceAccount = provider.wallet as anchor.Wallet;

  anchor.setProvider(provider);

  const program = anchor.workspace.Marketplace as Program<Marketplace>;

  const [masterAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("master_account_")],
    program.programId,
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
      aliceAccount.publicKey.toBase58(),
    );
  });

  it("list", async () => {
    // create token mint
    const tokenMint = await spl.createMint(
      provider.connection,
      aliceAccount.payer,
      aliceAccount.publicKey,
      aliceAccount.publicKey,
      0,
    );

    // associate token_mint to alice account
    const tokenAccount = await spl.getOrCreateAssociatedTokenAccount(
      provider.connection,
      aliceAccount.payer,
      tokenMint,
      aliceAccount.publicKey,
    );

    await spl.mintTo(
      provider.connection,
      aliceAccount.payer,
      tokenMint,
      tokenAccount.address,
      aliceAccount.payer,
      1,
    );

    const disableMintingTx = new anchor.web3.Transaction().add(
      spl.createSetAuthorityInstruction(
        tokenMint,
        aliceAccount.publicKey,
        spl.AuthorityType.MintTokens,
        null,
      ),
    );

    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      disableMintingTx,
      [aliceAccount.payer],
    );

    const [listingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("listing_account_"),
        aliceAccount.publicKey.toBuffer(),
        tokenMint.toBuffer(),
      ],
      program.programId,
    );

    const [marketTokenAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("market_token_account_"), tokenMint.toBuffer()],
      program.programId,
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
});
