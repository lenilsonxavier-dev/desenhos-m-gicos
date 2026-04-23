import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Download, Loader2 } from "lucide-react";

interface Drawing {
  id: string;
  image_path: string;
  created_at: string;
  url?: string;
}

export default function Gallery() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("drawings")
        .select("id, image_path, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const withUrls = await Promise.all(
        (data || []).map(async (d) => {
          const { data: signed } = await supabase.storage
            .from("drawings")
            .createSignedUrl(d.image_path, 3600);
          return { ...d, url: signed?.signedUrl };
        }),
      );
      setItems(withUrls);
      setLoading(false);
    })();
  }, [user]);

  const remove = async (d: Drawing) => {
    await supabase.storage.from("drawings").remove([d.image_path]);
    await supabase.from("drawings").delete().eq("id", d.id);
    setItems((prev) => prev.filter((x) => x.id !== d.id));
    toast({ title: "Removido" });
  };

  const download = (d: Drawing) => {
    if (!d.url) return;
    const link = document.createElement("a");
    link.href = d.url;
    link.download = `desenho-${d.id}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-primary font-body">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="font-display text-3xl">Minha Galeria 🖼️</h1>
          <span />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="font-body text-muted-foreground text-lg">Você ainda não salvou nenhum desenho.</p>
            <Link to="/"><Button className="font-display">Criar um desenho</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((d) => (
              <div key={d.id} className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                {d.url && <img src={d.url} alt="Desenho" className="w-full aspect-square object-contain bg-white" />}
                <div className="p-3 flex gap-2 justify-between">
                  <span className="text-xs text-muted-foreground font-body self-center">
                    {new Date(d.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => download(d)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(d)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}