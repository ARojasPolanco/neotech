import { MercadoPagoConfig, Preference } from "mercadopago";
import { envs } from "./enviroments/enviroments.js";

const client = new MercadoPagoConfig({ accessToken: envs.MP_ACCESS_TOKEN });

export { client, Preference };
