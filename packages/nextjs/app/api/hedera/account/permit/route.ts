import { NextResponse } from "next/server";
import {
  AccountId,
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

export const runtime = "nodejs";

function clientFromEnv() {
  const id = process.env.HEDERA_OPERATOR_ID;
  const key = process.env.HEDERA_OPERATOR_KEY;
  if (!id || !key) {
    throw new Error("Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY");
  }
  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(id), PrivateKey.fromStringECDSA(key));
  return client;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { owner, spender, cap, hours } = body as {
      owner?: string;
      spender?: string;
      cap?: string;
      hours?: string;
    };

    if (!owner || !spender || !cap || !hours) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = clientFromEnv();

    const topicTx = await new TopicCreateTransaction()
      .setTopicMemo("PermitKit ledger")
      .execute(client);
    const topicReceipt = await topicTx.getReceipt(client);
    const topicId = topicReceipt.topicId?.toString();
    if (!topicId) throw new Error("No topic id");

    const payload = JSON.stringify({
      type: "PERMIT_GRANT",
      owner,
      spender,
      capHbar: cap,
      expiresHours: hours,
      createdAt: new Date().toISOString(),
    });

    const msgTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(payload)
      .execute(client);
    const msgReceipt = await msgTx.getReceipt(client);

    client.close();

    return NextResponse.json({
      topicId,
      status: msgReceipt.status.toString(),
      hashscan: `https://hashscan.io/testnet/topic/${topicId}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Permit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}