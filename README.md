# PermitKit

A Scaffold-HBAR template for **capped spend permits**.

Someone connects a wallet, sets a cap and an expiry, and names a spender. PermitKit writes that grant to **Hedera Consensus Service**. The topic is the audit log.

## Why this template

Official starters cover tokens, schedules, oracles, and proof walls. They do not show “wallet login → grant a limited spend → public HCS receipt.”

## What you get

- Next.js app with wallet connect (Hedera testnet)
- `/permit` page (login required)
- API route that creates an HCS topic and submits the grant JSON
- HashScan link for every grant

## Scaffold

```bash
npm create scaffold-hbar@latest -- --template healer0x/permitkit