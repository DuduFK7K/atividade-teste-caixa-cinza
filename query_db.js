const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function queryUsers() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado ao banco de dados com sucesso!");

    // Consultar usuários existentes
    const res = await client.query("SELECT id, email, created_at, confirmed_at FROM auth.users LIMIT 10;");
    console.log("Usuários cadastrados no auth.users:");
    console.dir(res.rows, { depth: null });

  } catch (err) {
    console.error("Erro ao conectar ou consultar o banco:", err);
  } finally {
    await client.end();
  }
}

queryUsers();
