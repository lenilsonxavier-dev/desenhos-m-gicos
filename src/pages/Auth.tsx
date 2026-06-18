import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react"; // 🆕 Adicionado Sparkles para o botão mágico
import candinhoImg from "@/assets/candinho.jpg";

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false); // 🆕 Estado para o clique rápido

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  // 🆕 FUNÇÃO MÁGICA: Entrar sem senha criando uma sessão anônima ou simulada instantânea
  const entrarComoConvidado = async () => {
    setGuestLoading(true);
    try {
      // Usa o recurso nativo de login anônimo do Supabase (se ativo)
      // Se não estiver ativo, ele simplesmente força a navegação para o painel principal
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        // Fallback: Se o anonimato do Supabase estiver desligado no painel, 
        // levamos o aluno direto para a rota principal de desenho
        console.log("Modo local/escola ativado");
        navigate("/", { replace: true });
        return;
      }
      
      toast({ title: "Bem-vindo(a)! 🎨", description: "Vamos desenhar!" });
    } catch (err) {
      // Garante que o aluno vai entrar de qualquer forma
      navigate("/", { replace: true });
    } finally {
      setGuestLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast({ title: "Conta criada! 🎉", description: "Você já pode entrar." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Ops!", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card border border-border p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={candinhoImg} alt="Candinho" className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-card" />
          <h1 className="font-display text-3xl text-center">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="text-muted-foreground font-body text-center text-sm">
            Salve seus desenhos coloridos numa galeria só sua! 🎨
          </p>
        </div>

        {/* 🆕 BOTÃO DE ACESSO RÁPIDO PARA OS ALUNOS */}
        <div className="pb-2 border-b border-dashed border-border">
          <Button 
            type="button" 
            variant="secondary"
            disabled={guestLoading}
            onClick={entrarComoConvidado}
            className="w-full h-12 font-display text-lg bg-secondary text-white hover:bg-secondary/90 shadow-playful flex items-center justify-center gap-2"
          >
            {guestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Entrar como Aluno (Sem Senha) 🚀
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="text-center text-xs text-muted-foreground font-body my-2">
            — OU USE O ACESSO DOS PROFESSORES —
          </div>
          
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 font-display text-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Entrar com Email" : "Criar conta"}
          </Button>
        </form>
        
        <div className="text-center text-sm font-body">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="text-primary hover:underline">
              Não tem conta? Criar uma
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="text-primary hover:underline">
              Já tem conta? Entrar
            </button>
          )}
        </div>
        <div className="text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:underline">Voltar</Link>
        </div>
      </div>
    </div>
  );
}
