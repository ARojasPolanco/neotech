import "../src/config/enviroments/enviroments.js";
import sequelize from "../src/config/database/database.js";
import "../src/models/productModel.js";
import "../src/models/productVariantModel.js";
import "../src/models/associations.js";
import Product from "../src/models/productModel.js";
import ProductVariant from "../src/models/productVariantModel.js";

const products = [
  {
    name: "Auriculares Bluetooth SoundPro X1",
    slug: "auriculares-bluetooth-soundpro-x1",
    description: "Auriculares inalámbricos con cancelación de ruido activa y 30hs de batería.",
    price: 12500,
    category: "Auriculares",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 15 },
      { color: "Blanco", colorHex: "#FFFFFF", stock: 10 },
      { color: "Azul", colorHex: "#2563EB", stock: 8 },
    ],
  },
  {
    name: "Teclado Mecánico RGB MK-3",
    slug: "teclado-mecanico-rgb-mk-3",
    description: "Teclado mecánico con switches Cherry MX, retroiluminación RGB personalizable.",
    price: 18900,
    category: "Teclados",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 12 },
      { color: "Gris", colorHex: "#6B7280", stock: 7 },
    ],
  },
  {
    name: "Micrófono Condenser Studio MC-200",
    slug: "microfono-condenser-studio-mc-200",
    description: "Micrófono de condensador con diafragma grande, ideal para streaming y grabación.",
    price: 22500,
    category: "Micrófonos",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 6 },
    ],
  },
  {
    name: "Parlante Portátil BoomCast BT",
    slug: "parlante-portatil-boomcast-bt",
    description: "Parlante Bluetooth portátil con sonido 360° y resistencia al agua IPX7.",
    price: 15200,
    category: "Parlantes",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 20 },
      { color: "Rojo", colorHex: "#EF4444", stock: 10 },
      { color: "Azul", colorHex: "#3B82F6", stock: 10 },
    ],
  },
  {
    name: "Cargador Rápido GaN 65W",
    slug: "cargador-rapido-gan-65w",
    description: "Cargador compacto con tecnología GaN, 65W, puerto USB-C, carga rápida para laptops y smartphones.",
    price: 8900,
    category: "Cargadores",
    variants: [
      { color: "Blanco", colorHex: "#FFFFFF", stock: 25 },
      { color: "Negro", colorHex: "#000000", stock: 20 },
    ],
  },
  {
    name: "Base Carga Inalámbrica Qi Pro",
    slug: "base-carga-inalambrica-qi-pro",
    description: "Base de carga inalámbrica rápida compatible con todos los dispositivos Qi. Carga simultánea de hasta 3 dispositivos.",
    price: 6500,
    category: "Accesorios",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 18 },
      { color: "Blanco", colorHex: "#FFFFFF", stock: 14 },
    ],
  },
  {
    name: "Auriculares Gaming Over-ear GH-7",
    slug: "auriculares-gaming-over-ear-gh-7",
    description: "Auriculares over-ear con sonido envolvente 7.1, microfono retráctil y almohadillas de memory foam.",
    price: 21000,
    category: "Auriculares",
    variants: [
      { color: "Negro", colorHex: "#000000", stock: 10 },
      { color: "Blanco", colorHex: "#FFFFFF", stock: 5 },
    ],
  },
  {
    name: "Hub USB-C 7 en 1",
    slug: "hub-usb-c-7-en-1",
    description: "Hub multipuerto USB-C con HDMI 4K, 2x USB-A, lector SD, PD 100W.",
    price: 11200,
    category: "Accesorios",
    variants: [
      { color: "Gris", colorHex: "#6B7280", stock: 22 },
    ],
  },
];

async function main() {
  await sequelize.sync();

  const existing = await Product.count();

  if (existing > 0) {
    console.log(`Ya existen ${existing} productos. No se ejecuta el seeder.`);
    process.exit(0);
  }

  for (const productData of products) {
    const { variants, ...productFields } = productData;
    const product = await Product.create(productFields);

    for (const variant of variants) {
      await ProductVariant.create({
        productId: product.id,
        color: variant.color,
        colorHex: variant.colorHex,
        stock: variant.stock,
      });
    }

    console.log(`  ✅ ${product.name} (${variants.length} colores)`);
  }

  console.log(`\n${products.length} productos creados con éxito.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
