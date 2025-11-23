"use client";

import { useState } from "react";

export default function PayTestPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handlePay() {
    setLoading(true);

    const res = await fetch("/api/payway/create", {
      method: "POST",
      body: JSON.stringify({ amount: 1 }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.checkout_url) {
      window.location.href = data.checkout_url; // redirect to PayWay
    } else if (data.abapay_deeplink) {
      window.location.href = data.abapay_deeplink;
    } else if (data.qr_string) {
      alert("Scan QR: " + data.qr_string);
    } else {
      alert("PayWay response missing");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>ABA PayWay Test</h1>

      <button
        disabled={loading}
        onClick={handlePay}
        style={{
          padding: "12px 20px",
          background: "black",
          color: "white",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Pay 1 KHR"}
      </button>

      <br />
      <br />
      <p>Status: {status}</p>
    </div>
  );
}
