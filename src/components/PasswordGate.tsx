import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import candinhoImg from "@/assets/candinho.jpg";
import { toast } from "@/hooks/use-toast";

const PASSWORD = "6975";
const STORAGE_KEY = "candinho_access_v1";

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "ok") setUnlocked(true);
    setReady(true);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "ok");
      setUnlocked(true);
    } else {
      toast({ title: "Senha incorreta", variant: "destructive" });
      setValue("");
    }
  };

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm bg-card rounded-2xl shadow-card border border-border p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={candinhoImg} alt="Candinho" className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-card" />
          <h1 className="font-display text-2xl text-center flex items-center gap-2">
            <Lock className="w-5 h-5" /> Acesso restrito
          </h1>
          <p className="text-muted-foreground font-body text-center text-sm">
            Digite a senha para entrar.
          </p>
        </div>
        <Input
          type="password"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Senha"
          className="h-12 text-center text-lg font-body"
        />
        <Button type="submit" className="w-full h-12 font-display text-lg">
          Entrar
        </Button>
      </form>
    </div>
  );
}
