const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function cleanup() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    // Delete the SQL-inserted user
    await client.query("DELETE FROM auth.identities WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;");
    await client.query("DELETE FROM auth.users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;");
    console.log("Usuário SQL deletado.");
    const check = await client.query("SELECT count(*) FROM auth.users;");
    console.log("Total de usuários:", check.rows[0].count);
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await client.end();
  }
}

async function signupViaAPI() {
  const API_URL = "https://vojnbyvlykiijeqzbjmk.supabase.co/auth/v1/signup";
  const API_KEY = "sb_publishable_dfIHj8tgjmBRsgZtvlWO0Q_J1k6YTZN";

  // Try with a simple email
  const body = { email: "teste@gmail.com", password: "123456" };
  console.log("\nTentando signup via API...");
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "apikey": API_KEY,
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Response:", JSON.stringify(data, null, 2));

  // If that fails, try with email confirmation disabled
  if (response.status !== 200) {
    console.log("\nTentando com data.email_confirm=true...");
    const response2 = await fetch(API_URL, {
      method: "POST",
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...body, data: { email_confirm: true } })
    });
    const data2 = await response2.json();
    console.log("Status:", response2.status);
    console.log("Response:", JSON.stringify(data2, null, 2));
  }
}

async function main() {
  await cleanup();
  await signupViaAPI();
}

main();
