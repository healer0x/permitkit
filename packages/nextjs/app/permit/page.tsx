"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export default function PermitPage() {
  const { address, isConnected } = useAccount();
  const [cap, setCap] = useState("10");
  const [hours, setHours] = useState("24");
  const [spender, setSpender] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [link, setLink] = useState("");

  async function createPermit() {
    if (!address) return;
    setBusy(true);
    setResult("");
    setLink("");
    try {
      const res = await fetch("/api/hedera/account/permit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: address, spender, cap, hours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(`Logged on topic ${data.topicId}`);
      setLink(data.hashscan);
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <p className="text-sm uppercase tracking-wide opacity-60">Scaffold-HBAR template</p>
      <h1 className="text-4xl font-bold mt-2">PermitKit</h1>
      <p className="mt-3 opacity-80">Grant a capped spend. The grant is written to Hedera Consensus Service.</p>
      <div className="mt-8 p-4 rounded-xl bg-base-200">
        {isConnected ? (
          <p className="break-all text-sm">
            Logged in as <span className="font-mono">{address}</span>
          </p>
        ) : (
          <p>Connect a wallet in the top right to continue.</p>
        )}
      </div>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm">Spend cap (HBAR)</span>
          <input className="input input-bordered w-full mt-1" type="number" min="1" value={cap} onChange={e => setCap(e.target.value)} disabled={!isConnected} />
        </label>
        <label className="block">
          <span className="text-sm">Expires in (hours)</span>
          <input className="input input-bordered w-full mt-1" type="number" min="1" value={hours} onChange={e => setHours(e.target.value)} disabled={!isConnected} />
        </label>
        <label className="block">
          <span className="text-sm">Spender address</span>
          <input className="input input-bordered w-full mt-1 font-mono" placeholder="0x..." value={spender} onChange={e => setSpender(e.target.value)} disabled={!isConnected} />
        </label>
        <button className="btn btn-primary w-full" type="button" disabled={!isConnected || busy || !spender} onClick={createPermit}>
          {busy ? "Writing to testnet..." : "Create permit"}
        </button>
        {result && <p className="text-sm mt-2">{result}</p>}
        {link && (
          <a className="link text-sm" href={link} target="_blank" rel="noreferrer">
            Open on HashScan
          </a>
        )}
      </div>
    </div>
  );
}