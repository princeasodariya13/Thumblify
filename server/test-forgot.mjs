// Quick test — run with: node test-forgot.mjs
const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "apnacollege.part1.mercy@gmail.com" }), // sender's own email (from .env)
});
const data = await res.json();
console.log("Status:", res.status);
console.log("Response:", data);
