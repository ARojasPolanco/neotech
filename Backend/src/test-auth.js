import { ok, rechazo, fallo, callHandler, resetCounters, printResumen } from "./test-utils.js";
import { register, login } from "./controllers/authController.js";
import User from "./models/authModel.js";
import sequelize from "./config/database/database.js";

export async function runAuthTests() {
  resetCounters();
  console.log("\n--- Auth Tests ---\n");

  await sequelize.sync({ alter: true });

  // ── POSITIVOS ──

  const email = `test_${Date.now()}@test.com`;

  const regRes = await callHandler(register, {
    fullname: "Test User",
    email,
    password: "testpass123",
    acceptedTerms: true,
    acceptedMarketing: true,
  });

  if (regRes.statusCode === 201 && regRes.body.token) {
    ok(`Register with acceptedTerms creates user: ${regRes.body.user.email}`);
  } else {
    fallo("Register with acceptedTerms failed", regRes.body);
  }

  const loginRes = await callHandler(login, {
    email,
    password: "testpass123",
  });

  if (loginRes.statusCode === 200 && loginRes.body.token) {
    ok("Login with correct credentials returns JWT");
  } else {
    fallo("Login with correct credentials failed", loginRes.body);
  }

  // ── NEGATIVOS ──

  const regNoTerms = await callHandler(register, {
    fullname: "No Terms",
    email: `noterms_${Date.now()}@test.com`,
    password: "testpass123",
    acceptedTerms: false,
  });

  if (regNoTerms.statusCode === 422) {
    rechazo("Register without acceptedTerms rejected correctly");
  } else {
    fallo("Register without acceptedTerms should return 422", regNoTerms.body);
  }

  const loginBad = await callHandler(login, {
    email,
    password: "wrongpassword",
  });

  if (loginBad.statusCode === 401) {
    rechazo("Login with wrong password rejected correctly");
  } else {
    fallo("Login with wrong password should return 401", loginBad.body);
  }

  // Cleanup
  await User.destroy({ where: { email } });

  printResumen();
}
