import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Mail, Lock, Info } from "lucide-react";
import { ClientFormData } from "@/app/admin/clientes/novo/schema";

export function StepAccess() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ClientFormData>();
  const enviarEmail = watch("enviarEmailBoasVindas");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#1A1A1A] uppercase flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#0076FF]" />
            E-mail de Login <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("loginEmail")}
            type="email"
            className={`h-12 border-2 rounded-xl focus:border-[#0076FF] transition-all ${
              errors.loginEmail ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
            placeholder="cliente@exemplo.com"
          />
          {errors.loginEmail && <p className="text-xs text-red-500 font-medium">{errors.loginEmail.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#1A1A1A] uppercase flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0076FF]" />
            Senha Inicial <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className={`h-12 border-2 rounded-xl focus:border-[#0076FF] transition-all ${
              errors.password ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between p-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl group transition-all hover:bg-blue-50 hover:border-blue-200">
        <div className="space-y-1">
          <Label className="text-base font-bold text-[#0076FF] flex items-center gap-2">
            <Mail className="h-4 w-4" /> Notificação de Boas-Vindas
          </Label>
          <p className="text-sm text-slate-600 flex items-center gap-1.5 leading-relaxed">
            <Info className="h-3.5 w-3.5 opacity-60" />
            Enviar e-mail automático com as credenciais de primeiro acesso para o cliente.
          </p>
        </div>
        <Switch
          className="data-[state=checked]:bg-[#0076FF]"
          checked={enviarEmail}
          onCheckedChange={(val) => setValue("enviarEmailBoasVindas", val, { shouldValidate: true })}
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-xs text-[#64748B] flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
          <span>
            <b>Importante:</b> Estas credenciais serão usadas pelo cliente para acessar o Portal Infinity. 
            Recomendamos senhas fortes com letras, números e símbolos.
          </span>
        </p>
      </div>
    </div>
  );
}
