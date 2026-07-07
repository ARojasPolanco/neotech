import "../config/enviroments/enviroments.js";
import sequelize from "../config/database/database.js";
import "../models/authModel.js";
import User from "../models/authModel.js";

async function main() {
  await sequelize.sync();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@neotech.com";

  const existing = await User.findOne({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    process.exit(0);
  }

  await User.create({
    fullname: "Admin",
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "ADMIN",
    acceptedTerms: true,
    acceptedMarketing: false,
    termsAcceptedAt: new Date(),
  });

  console.log(`Admin user created: ${adminEmail}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
