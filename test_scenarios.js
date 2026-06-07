const API_URL = "https://vojnbyvlykiijeqzbjmk.supabase.co/auth/v1/token?grant_type=password";
const API_KEY = "sb_publishable_dfIHj8tgjmBRsgZtvlWO0Q_J1k6YTZN";

const scenarios = [
  {
    name: "CT-001 - Login válido",
    body: { email: "teste@gmail.com", password: "12345" },
    expected: "Status 200 + access_token"
  },
  {
    name: "CT-002 - Senha incorreta",
    body: { email: "teste@gmail.com", password: "senhaerrada" },
    expected: "Erro de autenticação (400)"
  },
  {
    name: "CT-003 - Usuário inexistente",
    body: { email: "naoexiste999@outlook.com", password: "12345" },
    expected: "Acesso negado (400)"
  },
  {
    name: "CT-004 - Campos vazios",
    body: { email: "", password: "" },
    expected: "Erro de validação (400)"
  },
  {
    name: "CT-005 - Credenciais inválidas",
    body: { email: "emailinvalido", password: "abc" },
    expected: "Mensagem de erro (400)"
  }
];

async function runTests() {
  const results = [];

  for (const scenario of scenarios) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`CENÁRIO: ${scenario.name}`);
    console.log(`Entrada: ${JSON.stringify(scenario.body)}`);
    console.log(`Resultado Esperado: ${scenario.expected}`);
    console.log(`${"=".repeat(60)}`);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "apikey": API_KEY,
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(scenario.body)
      });

      const status = response.status;
      const statusText = response.statusText;
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { raw: await response.text() };
      }

      const success = scenario.name.includes("Login válido") ? status === 200 : status >= 400;

      console.log(`\nStatus HTTP: ${status} ${statusText}`);
      console.log(`Resposta JSON:`);
      console.log(JSON.stringify(data, null, 2));
      console.log(`\nResultado: ${success ? "✅ SUCESSO" : "❌ FALHA"}`);

      results.push({
        id: scenario.name.split(" - ")[0],
        cenario: scenario.name.split(" - ")[1],
        entrada: JSON.stringify(scenario.body),
        esperado: scenario.expected,
        obtido: `Status ${status} - ${data.msg || (data.access_token ? "access_token retornado" : JSON.stringify(data))}`,
        status: success ? "Sucesso" : "Falha",
        response_full: data
      });
    } catch (error) {
      console.error("Erro na requisição:", error);
      results.push({
        id: scenario.name.split(" - ")[0],
        cenario: scenario.name.split(" - ")[1],
        entrada: JSON.stringify(scenario.body),
        esperado: scenario.expected,
        obtido: `Erro: ${error.message}`,
        status: "Falha",
        response_full: null
      });
    }
  }

  console.log(`\n\n${"=".repeat(60)}`);
  console.log("RESUMO DOS TESTES");
  console.log(`${"=".repeat(60)}`);
  results.forEach(r => {
    console.log(`${r.id} | ${r.cenario} | ${r.status}`);
  });

  // Save results as JSON for later use
  const fs = require('fs');
  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log("\nResultados salvos em test_results.json");
}

runTests();
