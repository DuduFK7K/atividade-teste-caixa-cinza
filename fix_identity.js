const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function fixIdentity() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado!");

    const userId = '585b0764-7272-4e12-b456-2f2b48e34e04';
    const now = new Date().toISOString();

    // Check schema of identities table
    const schemaRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'identities'
      ORDER BY ordinal_position;
    `);
    console.log("Schema de auth.identities:");
    schemaRes.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

    // Create the identity with proper types
    const identityQuery = `
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        created_at, updated_at, last_sign_in_at
      ) VALUES (
        gen_random_uuid(), $1::uuid, 
        '{"sub":"585b0764-7272-4e12-b456-2f2b48e34e04","email":"teste@gmail.com","email_verified":true}'::jsonb,
        'email', '585b0764-7272-4e12-b456-2f2b48e34e04', 
        $2::timestamptz, $2::timestamptz, $2::timestamptz
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;

    const identityResult = await client.query(identityQuery, [userId, now]);
    console.log("Identidade criada:", identityResult.rows);

  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await client.end();
  }
}

fixIdentity();
