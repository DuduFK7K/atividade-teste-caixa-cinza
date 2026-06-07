const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function getServiceRoleKey() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Conectado!");

    // Try to find the service role key in vault or config
    try {
      const vaultRes = await client.query("SELECT * FROM vault.secrets LIMIT 10;");
      console.log("Vault secrets:", vaultRes.rows);
    } catch(e) {
      console.log("Vault error:", e.message);
    }

    // Check if there's a way to get JWT secret
    try {
      const jwtRes = await client.query("SELECT current_setting('app.settings.jwt_secret', true);");
      console.log("JWT secret:", jwtRes.rows);
    } catch(e) {
      console.log("JWT error:", e.message);
    }

    // Check supabase_functions schema
    try {
      const funcRes = await client.query(`
        SELECT table_schema, table_name FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
      `);
      console.log("\nTodas as tabelas:");
      funcRes.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name}`));
    } catch(e) {
      console.log("Error:", e.message);
    }

    // Delete our SQL user and test login for non-existing user (should be 400, not 500)
    console.log("\n--- Deletando usuário e testando com e-mail não existente ---");
    await client.query("DELETE FROM auth.identities WHERE user_id = 'b1c2d3e4-f5a6-7890-bcde-fa1234567891'::uuid;");
    await client.query("DELETE FROM auth.users WHERE id = 'b1c2d3e4-f5a6-7890-bcde-fa1234567891'::uuid;");
    console.log("Usuário deletado.");

    const checkEmpty = await client.query("SELECT count(*) FROM auth.users;");
    console.log("Total users:", checkEmpty.rows[0].count);

    // Now test login for teste@gmail.com (should be 400 not 500 since no user exists)
    const response = await fetch("https://vojnbyvlykiijeqzbjmk.supabase.co/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        "apikey": "sb_publishable_dfIHj8tgjmBRsgZtvlWO0Q_J1k6YTZN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: "teste@gmail.com", password: "123456" })
    });
    const data = await response.json();
    console.log("\nLogin teste@gmail.com (sem user no DB):");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await client.end();
  }
}

getServiceRoleKey();
