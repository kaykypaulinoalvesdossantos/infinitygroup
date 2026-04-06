import * as z from "zod";

// Campos de texto opcionais: no formulário é string | undefined, mas validado como string
const optStr = z.string().optional().transform(v => v ?? "");

export const clientSchema = z.object({
  // 1. Identificação
  type:     z.enum(["pf", "pj"]),
  name:     z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  document: optStr,

  // 2. Portal e Acesso
  loginEmail:             z.string().email("E-mail inválido"),
  password:               z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  enviarEmailBoasVindas:  z.boolean(),
  notes:                  optStr,

  // 3. Endereço e Contato
  phone: optStr,
  address: z.object({
    zipCode:      z.string().min(8, "CEP inválido (mínimo 8 dígitos)"),
    street:       z.string().min(1, "Rua é obrigatória"),
    streetNumber: z.string().min(1, "Número é obrigatório"),
    complement:   optStr,
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city:         z.string().min(1, "Cidade é obrigatória"),
    state:        z.string().length(2, "UF inválida — use 2 letras, ex: SP"),
  }),

  // 4. Assinaturas
  subscriptions: z.array(z.object({
    productType:           z.enum(["SITE", "PROJETOS", "SISTEMAS", "AUTOMACAO", "CELULAR", "ECOMMERCE", "CRM_TELECOM"]),
    productName:           z.string().min(1, "Nome do produto é obrigatório"),
    description:           optStr,
    monthlyFeeCents:       z.coerce.number().min(1, "A mensalidade deve ser maior que zero"),
    implementationFeeCents:z.coerce.number(),
    billingDayOfMonth:     z.coerce.number().min(1).max(31),
    startDate:             z.string().min(1, "Data de início é obrigatória"),
    contractDurationMonths:z.coerce.number().min(1),
    isProrataEnabled:      z.boolean(),
    isLifetime:            z.boolean(),
    // CRM Telecom — só valido quando productType === CRM_TELECOM
    crmBillingType:   z.enum(["FIXED", "PER_USER"]),
    crmTenantId:      optStr,
    responsibleName:  optStr,
    responsibleEmail: optStr,
  })).min(1, "Adicione pelo menos um produto/serviço"),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Valores padrão de uma assinatura nova
export const defaultSubscription: ClientFormData["subscriptions"][0] = {
  productType:            "SITE",
  productName:            "",
  description:            "",
  monthlyFeeCents:        0,
  implementationFeeCents: 0,
  billingDayOfMonth:      10,
  startDate:              new Date().toISOString().split("T")[0],
  contractDurationMonths: 12,
  isProrataEnabled:       true,
  isLifetime:             false,
  crmBillingType:         "FIXED",
  crmTenantId:            "",
  responsibleName:        "",
  responsibleEmail:       "",
};

// Valores padrão do formulário inteiro
export const defaultFormValues: ClientFormData = {
  type:                   "pf",
  name:                   "",
  document:               "",
  loginEmail:             "",
  password:               "",
  enviarEmailBoasVindas:  true,
  notes:                  "",
  phone:                  "",
  address: {
    zipCode:      "",
    street:       "",
    streetNumber: "",
    complement:   "",
    neighborhood: "",
    city:         "",
    state:        "",
  },
  subscriptions: [{ ...defaultSubscription }],
};
