import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Building2, User, FileText } from "lucide-react";
import { ClientFormData } from "@/app/admin/clientes/novo/schema";

export function StepIdentity() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ClientFormData>();
  const isCompany = watch("type") === "pj";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Label className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
              {isCompany ? (
                <Building2 className="h-4 w-4 text-orange-600" />
              ) : (
                <User className="h-4 w-4 text-purple-600" />
              )}
              Tipo de Pessoa
            </Label>
            <Badge
              variant="outline"
              className={`text-sm font-semibold px-3 py-1.5 transition-colors ${
                isCompany
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-purple-300 bg-purple-50 text-purple-700"
              }`}
            >
              {isCompany ? "Pessoa Jurídica (CNPJ)" : "Pessoa Física (CPF)"}
            </Badge>
          </div>
          <div className="flex flex-col items-center gap-2 pt-1">
            <Switch
              checked={isCompany}
              onCheckedChange={(val) => {
                 setValue("type", val ? "pj" : "pf", { shouldValidate: true });
                 if (!val) setValue("document", ""); // Limpa se mudar p/ PF p/ evitar erro de máscara se houver
              }}
            />
            <span className="text-xs font-medium text-[#64748B]">
              {isCompany ? "PJ" : "PF"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#1A1A1A] uppercase flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0076FF]" />
            {isCompany ? "Razão Social" : "Nome Completo"} <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("name")}
            className={`h-12 border-2 rounded-xl focus:border-[#0076FF] transition-all ${
              errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
            placeholder={isCompany ? "Digite a razão social" : "Digite o nome completo"}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#1A1A1A] uppercase flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-[#0076FF]" />
            {isCompany ? "CNPJ" : "CPF"}
          </Label>
          <Input
            {...register("document")}
            className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] font-mono"
            placeholder={isCompany ? "00.000.000/0000-00" : "000.000.000-00"}
          />
        </div>
      </div>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>;
}
