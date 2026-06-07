const { Client } = require('pg');

const connectionString = "postgresql://postgres.vojnbyvlykiijeqzbjmk:3WyKBoMDd7S0uTqA@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Conectado ao banco!");

    const email = "teste@gmail.com";
    const password = "12345"; // Email e senha informados pelo usuário

    // 1. Limpeza
    await client.query("DELETE FROM auth.identities WHERE identity_data->>'email' = $1 OR user_id IN (SELECT id FROM auth.users WHERE email = $1)", [email]);
    await client.query("DELETE FROM auth.users WHERE email = $1", [email]);
    console.log("Usuários anteriores removidos.");

    const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const now = new Date().toISOString();

    // 2. Inserir User com campos nulos definidos como string vazia ''
    const insertQuery = `
      INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, is_sso_user, is_anonymous,
        phone, phone_change, phone_change_token, email_change_token_current, reauthentication_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        $1::uuid, 'authenticated', 'authenticated', $2,
        crypt($3, gen_salt('bf', 10)),
        $4::timestamptz,
        $4::timestamptz, $4::timestamptz,
        '', '', '', '',
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false, false, false,
        NULL, '', '', '', ''
      )
      RETURNING id, email, confirmed_at;
    `;

    const userResult = await client.query(insertQuery, [userId, email, password, now]);
    console.log("Usuário inserido via SQL:", userResult.rows[0]);

    // 3. Inserir Identidade
    const identityQuery = `
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        created_at, updated_at, last_sign_in_at
      ) VALUES (
        $1::uuid, $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true, 'phone_verified', false),
        'email', $1::text,
        $3::timestamptz, $3::timestamptz, $3::timestamptz
      )
      RETURNING id;
    `;
    const identityResult = await client.query(identityQuery, [userId, email, now]);
    console.log("Identidade inserida via SQL:", identityResult.rows[0]);

    // 4. Testar Login
    console.log("\n--- Testando login via API ---");
    const response = await fetch("https://vojnbyvlykiijeqzbjmk.supabase.co/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        "apikey": "sb_publishable_dfIHj8tgjmBRsgZtvlWO0Q_J1k6YTZN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await response.json();
    console.log("Login status:", response.status);
    console.log("Login response:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Erro no processo:", err.message);
  } finally {
    await client.end();
  }
}

main();
