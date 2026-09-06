import "../src/config/enviroments/enviroments.js";
import sequelize from "../src/config/database/database.js";
import "../src/models/authModel.js";
import User from "../src/models/authModel.js";
import bcrypt from "bcrypt";

async function main() {
  await sequelize.sync();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@neotech.com";
  const newPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const existing = await User.findOne({ where: { email: adminEmail } });

  if (existing) {
    await existing.update({ password: hashedPassword });
    console.log(`Contraseña actualizada para: ${adminEmail}`);
  } else {
    await User.create({
      fullname: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      acceptedTerms: true,
      acceptedMarketing: false,
      termsAcceptedAt: new Date(),
    });
    console.log(`Usuario admin creado: ${adminEmail}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
