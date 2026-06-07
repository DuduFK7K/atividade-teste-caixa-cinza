const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fixGrants() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Conectado!");

    // Grant all privileges on auth schema to supabase_auth_admin
    const grants = [
      "GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;",
      "GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;",
      "GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;",
      "GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON ROUTINES TO supabase_auth_admin;",
    ];

    for (const grant of grants) {
      try {
        await client.query(grant);
        console.log("OK:", grant);
      } catch(e) {
        console.log("ERRO:", grant, "-", e.message);
      }
    }

    // Now test login again
    console.log("\n--- Testando login via API ---");
    const response = await fetch("https://vojnbyvlykiijeqzbjmk.supabase.co/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        "apikey": "sb_publishable_dfIHj8tgjmBRsgZtvlWO0Q_J1k6YTZN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: "teste@gmail.com", password: "123456" })
    });
    const data = await response.json();
    console.log("Login status:", response.status);
    console.log("Login response:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await client.end();
  }
}

fixGrants();
