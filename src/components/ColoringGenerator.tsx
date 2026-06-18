import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import candinhoImg from "@/assets/candinho.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, Palette, LogIn, LogOut, Image as ImageIcon } from "lucide-react";
import { FileImage, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/useAuth";import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import candinhoImg from "@/assets/candinho.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Palette, LogIn, LogOut, Image as ImageIcon } from "lucide-react";
import { FileImage, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/useAuth";

// 🌍 BANCO DE IMAGENS ECOLÓGICO (MOLDURAS LOCAIS)
// Você pode substituir essas URLs de exemplo pelas URLs das suas imagens pretas e brancas do seu Storage ou pasta public!
const MOLDURAS_LOCAIS: Record<string, string> = {
  "unicórnio": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop", // Troque pela imagem real de contorno
  "dragão bebê": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
  "castelo mágico": "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
  "borboleta": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  "foguete no espaço": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  "gatinho fofo": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop",
  "arco-íris": "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop",
  "sereia": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
  "padrão": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" // Fallback lúdico
};

const suggestions = [
  "🦄 Unicórnio",
  "🐉 Dragão bebê",
  "🏰 Castelo mágico",
  "🦋 Borboleta",
  "🚀 Foguete no espaço",
  "🐱 Gatinho fofo",
  "🌈 Arco-íris",
  "🧜‍♀️ Sereia",
];

export function ColoringGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // 🚀 LOGICA ULTRA-RÁPIDA E GRATUITA
  const generate = async (text?: string) => {
    const input = text || prompt;
    if (!input.trim()) {
      toast({ title: "Escreva o que quer desenhar! ✏️", variant: "destructive" });
      return;
    }

    setLoading(true);
    setImageUrl(null);

    // Simula o tempo do "Pincel Mágico" trabalhando (bom para o engajamento das crianças)
    setTimeout(() => {
      const busca = input.toLowerCase();
      
      // Tenta achar qual palavra-chave combina melhor com o que a criança digitou
      let chaveEncontrada = "padrão";
      for (const chave of Object.keys(MOLDURAS_LOCAIS)) {
        if (busca.includes(chave)) {
          chaveEncontrada = chave;
          break;
        }
      }

      setImageUrl(MOLDURAS_LOCAIS[chaveEncontrada]);
      setLoading(false);
      toast({ title: "Desenho gerado com sucesso! 🎉" });
    }, 1200);
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `colorir-${Date.now()}.png`;
    link.click();
  };

  const downloadPdf = async () => {
    if (!imageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
      pdf.save(`colorir-${Date.now()}.pdf`);
    } catch {
      toast({ title: "Erro ao gerar PDF 😢", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-8">
      {/* Top bar */}
      <div className="w-full flex justify-end gap-2 -mb-4">
        {user ? (
          <>
            <Link to="/galeria">
              <Button variant="outline" size="sm" className="font-body">
                <ImageIcon className="w-4 h-4" /> Galeria
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="font-body">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm" className="font-body">
              <LogIn className="w-4 h-4" /> Entrar
            </Button>
          </Link>
        )}
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-display text-foreground flex items-center justify-center gap-2 sm:gap-3 flex-nowrap">
          CANDINHO DESENHISTA
          <img src={candinhoImg} alt="Candinho" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover shadow-card border-2 sm:border-4 border-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Diga o desenho que você quer e eu faço! ✨
        </p>
      </div>

      {/* Input area */}
      <div className="w-full space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Ex: um gatinho fofo 🐱"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            className="text-lg h-14 bg-card shadow-card font-body"
            disabled={loading}
          />
          <Button
            onClick={() => generate()}
            disabled={loading}
            className="h-14 px-6 text-lg font-display shadow-playful"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="ml-2 hidden sm:inline">Criar!</span>
          </Button>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                const termoLimpo = s.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
                setPrompt(termoLimpo);
                generate(termoLimpo);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-card text-sm font-body text-foreground border border-border hover:border-primary hover:shadow-playful transition-all disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-body text-lg animate-pulse">
            Desenhando... 🎨
          </p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="w-full space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-2xl shadow-card p-4 border border-border">
            <img
              src={imageUrl}
              alt="Desenho para colorir"
              className="w-full rounded-xl max-h-[400px] object-contain mx-auto"
            />
          </div>
          <div className="flex justify-center">
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                onClick={() => navigate("/colorir", { state: { imageUrl } })}
                size="lg"
                className="font-display text-lg gap-2 shadow-playful"
              >
                <Palette className="w-5 h-5" />
                Colorir Online
              </Button>
              <Button
                onClick={downloadImage}
                variant="outline"
                size="lg"
                className="font-display text-lg gap-2"
              >
                <FileImage className="w-5 h-5" />
                Baixar PNG
              </Button>
              <Button
                onClick={downloadPdf}
                variant="outline"
                size="lg"
                className="font-display text-lg gap-2"
              >
                <FileText className="w-5 h-5" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const suggestions = [
  "🦄 Unicórnio",
  "🐉 Dragão bebê",
  "🏰 Castelo mágico",
  "🦋 Borboleta",
  "🚀 Foguete no espaço",
  "🐱 Gatinho fofo",
  "🌈 Arco-íris",
  "🧜‍♀️ Sereia",
];

export function ColoringGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const generate = async (text?: string) => {
    const input = text || prompt;
    if (!input.trim()) {
      toast({ title: "Escreva o que quer desenhar! ✏️", variant: "destructive" });
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-coloring", {
        body: { prompt: input },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setImageUrl(data.imageUrl);
    } catch (e: any) {
      toast({
        title: "Ops! Algo deu errado 😢",
        description: e.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `colorir-${Date.now()}.png`;
    link.click();
  };

  const downloadPdf = async () => {
    if (!imageUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
      pdf.save(`colorir-${Date.now()}.pdf`);
    } catch {
      toast({ title: "Erro ao gerar PDF 😢", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-8">
      {/* Top bar */}
      <div className="w-full flex justify-end gap-2 -mb-4">
        {user ? (
          <>
            <Link to="/galeria">
              <Button variant="outline" size="sm" className="font-body">
                <ImageIcon className="w-4 h-4" /> Galeria
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="font-body">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm" className="font-body">
              <LogIn className="w-4 h-4" /> Entrar
            </Button>
          </Link>
        )}
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-display text-foreground flex items-center justify-center gap-2 sm:gap-3 flex-nowrap">
          CANDINHO DESENHISTA
          <img src={candinhoImg} alt="Candinho" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover shadow-card border-2 sm:border-4 border-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Diga o desenho que você quer  e eu faço! ✨
        </p>
      </div>

      {/* Input area */}
      <div className="w-full space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Ex: um dinossauro tocando violão 🎸"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            className="text-lg h-14 bg-card shadow-card font-body"
            disabled={loading}
          />
          <Button
            onClick={() => generate()}
            disabled={loading}
            className="h-14 px-6 text-lg font-display shadow-playful"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="ml-2 hidden sm:inline">Criar!</span>
          </Button>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setPrompt(s);
                generate(s);
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-card text-sm font-body text-foreground border border-border hover:border-primary hover:shadow-playful transition-all disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-body text-lg animate-pulse">
            Desenhando... 🎨
          </p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="w-full space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-2xl shadow-card p-4 border border-border">
            <img
              src={imageUrl}
              alt="Desenho para colorir"
              className="w-full rounded-xl"
            />
          </div>
          <div className="flex justify-center">
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                onClick={() => navigate("/colorir", { state: { imageUrl } })}
                size="lg"
                className="font-display text-lg gap-2 shadow-playful"
              >
                <Palette className="w-5 h-5" />
                Colorir Online
              </Button>
              <Button
                onClick={downloadImage}
                variant="outline"
                size="lg"
                className="font-display text-lg gap-2"
              >
                <FileImage className="w-5 h-5" />
                Baixar PNG
              </Button>
              <Button
                onClick={downloadPdf}
                variant="outline"
                size="lg"
                className="font-display text-lg gap-2"
              >
                <FileText className="w-5 h-5" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
