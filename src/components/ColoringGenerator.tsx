import { useState } from "react";
import candinhoImg from "@/assets/candinho.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Download, Loader2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 gap-8">
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
            <Button
              onClick={downloadImage}
              variant="outline"
              size="lg"
              className="font-display text-lg gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar Desenho
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}