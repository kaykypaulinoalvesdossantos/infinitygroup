import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Loader2, Home, Navigation } from "lucide-react";
import { useState } from "react";
import { ClientFormData } from "../../../app/admin/clientes/novo/schema";

export function StepAddress() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<ClientFormData>();
  const [searchingCep, setSearchingCep] = useState(false);
  
  const zipCode = watch("address.zipCode");

  const handleCepBlur = async () => {
    const rawCep = zipCode?.replace(/\D/g, "");
    if (rawCep?.length === 8) {
      setSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue("address.street", data.logradouro, { shouldValidate: true });
          setValue("address.neighborhood", data.bairro, { shouldValidate: true });
          setValue("address.city", data.localidade, { shouldValidate: true });
          setValue("address.state", data.uf, { shouldValidate: true });
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setSearchingCep(false);
      }
    }
  };

  const applyPhoneMask = (val: string) => {
    let value = val.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 5) {
      return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      return value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    return value;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2 max-w-sm">
        <Label className="text-sm font-semibold text-[#1A1A1A] uppercase flex items-center gap-2">
          <Phone className="h-4 w-4 text-[#0076FF]" />
          WhatsApp / Telefone
        </Label>
        <Input 
          {...register("phone")}
          onChange={(e) => {
             const masked = applyPhoneMask(e.target.value);
             setValue("phone", masked, { shouldValidate: true });
          }}
          className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF]" 
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4 pt-4 border-t border-slate-100">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">CEP <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input 
              {...register("address.zipCode")}
              onBlur={handleCepBlur}
              placeholder="00000-000" 
              maxLength={9} 
              className={`h-11 border-2 rounded-xl pr-10 ${errors.address?.zipCode ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {searchingCep && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#0076FF]" />
              </div>
            )}
          </div>
          {errors.address?.zipCode && <p className="text-[10px] text-red-500 font-bold">{errors.address.zipCode.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Rua / Logradouro <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Home className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input 
              {...register("address.street")}
              className={`h-11 border-2 pl-10 rounded-xl ${errors.address?.street ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
          </div>
          {errors.address?.street && <p className="text-[10px] text-red-500 font-bold">{errors.address.street.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Número <span className="text-red-500">*</span></Label>
          <Input 
            {...register("address.streetNumber")}
            placeholder="SN" 
            className={`h-11 border-2 rounded-xl ${errors.address?.streetNumber ? "border-red-300 bg-red-50" : "border-slate-200"}`}
          />
          {errors.address?.streetNumber && <p className="text-[10px] text-red-500 font-bold">{errors.address.streetNumber.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Complemento</Label>
          <Input 
            {...register("address.complement")}
            placeholder="Apto/Sala" 
            className="h-11 border-2 border-slate-200 rounded-xl"
          />
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Bairro <span className="text-red-500">*</span></Label>
          <Input 
            {...register("address.neighborhood")}
            className={`h-11 border-2 rounded-xl ${errors.address?.neighborhood ? "border-red-300 bg-red-50" : "border-slate-200"}`}
          />
          {errors.address?.neighborhood && <p className="text-[10px] text-red-500 font-bold">{errors.address.neighborhood.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Cidade <span className="text-red-500">*</span></Label>
          <div className="relative">
             <Navigation className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
             <Input 
                {...register("address.city")}
                className={`h-11 border-2 pl-10 rounded-xl ${errors.address?.city ? "border-red-300 bg-red-50" : "border-slate-200"}`}
              />
          </div>
          {errors.address?.city && <p className="text-[10px] text-red-500 font-bold">{errors.address.city.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Estado (UF) <span className="text-red-500">*</span></Label>
          <Input 
            {...register("address.state")}
            placeholder="SP" 
            maxLength={2} 
            className={`h-11 border-2 rounded-xl uppercase ${errors.address?.state ? "border-red-300 bg-red-50" : "border-slate-200"}`}
          />
          {errors.address?.state && <p className="text-[10px] text-red-500 font-bold">{errors.address.state.message}</p>}
        </div>
      </div>
    </div>
  );
}
