import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import candinhoImg from "@/assets/candinho.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Palette, LogIn, LogOut, Image as ImageIcon } from "lucide-react";
import { FileImage, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/useAuth";

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

  // 🤖 CONEXÃO COM O HUGGING FACE
  const generate = async (text?: string) => {
    const input = text || prompt;
    if (!input.trim()) {
      toast({ title: "Escreva o que quer desenhar! ✏️", variant: "destructive" });
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
     // 🔒 Agora o código fica protegido e o GitHub não barra!
const HUGGING_FACE_TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN;
      
      // Modelo excelente e super leve para desenhos de contorno e páginas de colorir
      const MODEL_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

      // Engenharia de prompt automática para garantir que saia em preto e branco para as crianças
      const promptFormatado = `coloring page for kids, clean black and white outline art, vector style, white background, no gradients, no shading, simple lines, ${input}`;

      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: promptFormatado }),
      });

      if (!response.ok) {
        throw new Error("O servidor do Hugging Face está processando ou sobrecarregado. Tente novamente em alguns segundos!");
      }

      // Transforma a resposta binária da imagem em uma URL legível para a tag <img>
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      
      setImageUrl(localUrl);
      toast({ title: "O Pincel Mágico do Candinho criou seu desenho! 🎉" });
    } catch (e: any) {
      toast({
        title: "Ops! O Candinho se atrapalhou um pouco 😢",
        description: e.message || "Tente clicar em Criar novamente.",
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
      {/* Barra Superior */}
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

      {/* Título Principal */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-display text-foreground flex items-center justify-center gap-2 sm:gap-3 flex-nowrap">
          CANDINHO DESENHISTA
          <img src={candinhoImg} alt="Candinho" className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover shadow-card border-2 sm:border-4 border-primary shrink-0" />
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Diga o desenho que você quer e eu faço! ✨
        </p>
      </div>

      {/* Input de Texto */}
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

        {/* Tags de Sugestão */}
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

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-body text-lg animate-pulse">
            O Pincel Mágico está desenhando... 🎨
          </p>
        </div>
      )}

      {/* Exibição do Desenho Gerado */}
      {imageUrl && !loading && (
        <div className="w-full space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-2xl shadow-card p-4 border border-border">
            <img
              src={imageUrl}
              alt="Desenho para colorir"
              className="w-full rounded-xl max-h-[500px] object-contain mx-auto bg-white"
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
