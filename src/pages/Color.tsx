import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Brush, Pencil, SprayCan, PaintBucket, Eraser, Undo2, Redo2,
  Download, Save, ArrowLeft, FileText, Image as ImageIcon, Loader2,
} from "lucide-react";
import jsPDF from "jspdf";

type Tool = "brush" | "pencil" | "spray" | "bucket" | "eraser";

const PALETTE = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316",
  "#EAB308", "#22C55E", "#14B8A6", "#3B82F6",
  "#8B5CF6", "#EC4899", "#92400E", "#A1A1AA",
];

export default function Color() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const initialUrl = (location.state as any)?.imageUrl as string | undefined;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const futureRef = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState(PALETTE[2]);
  const [size, setSize] = useState(8);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  // Load image into canvas
  useEffect(() => {
    if (!initialUrl) {
      navigate("/", { replace: true });
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      baseImgRef.current = img;
      historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      futureRef.current = [];
      setReady(true);
    };
    img.onerror = () => toast({ title: "Erro ao carregar desenho", variant: "destructive" });
    img.src = initialUrl;
  }, [initialUrl, navigate]);

  const pushHistory = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 30) historyRef.current.shift();
    futureRef.current = [];
  };

  const undo = () => {
    if (historyRef.current.length <= 1) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const current = historyRef.current.pop()!;
    futureRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(prev, 0, 0);
  };

  const redo = () => {
    if (!futureRef.current.length) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const next = futureRef.current.pop()!;
    historyRef.current.push(next);
    ctx.putImageData(next, 0, 0);
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const hexToRgba = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
  };

  const floodFill = (x: number, y: number, fillHex: string) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const sx = Math.floor(x), sy = Math.floor(y);
    const startIdx = (sy * w + sx) * 4;
    const sr = data[startIdx], sg = data[startIdx + 1], sb = data[startIdx + 2], sa = data[startIdx + 3];
    const [fr, fg, fb, fa] = hexToRgba(fillHex);
    if (sr === fr && sg === fg && sb === fb && sa === fa) return;
    const tol = 40; // tolerance to fill close-to-black borders gracefully
    const match = (i: number) =>
      Math.abs(data[i] - sr) <= tol &&
      Math.abs(data[i + 1] - sg) <= tol &&
      Math.abs(data[i + 2] - sb) <= tol;
    const stack: number[] = [sx, sy];
    while (stack.length) {
      const py = stack.pop()!;
      const px = stack.pop()!;
      let nx = px;
      let i = (py * w + nx) * 4;
      while (nx >= 0 && match(i)) { nx--; i -= 4; }
      nx++; i += 4;
      let spanUp = false, spanDown = false;
      while (nx < w && match(i)) {
        data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa;
        if (py > 0) {
          const up = i - w * 4;
          if (match(up)) {
            if (!spanUp) { stack.push(nx, py - 1); spanUp = true; }
          } else spanUp = false;
        }
        if (py < h - 1) {
          const dn = i + w * 4;
          if (match(dn)) {
            if (!spanDown) { stack.push(nx, py + 1); spanDown = true; }
          } else spanDown = false;
        }
        nx++; i += 4;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  const drawSpray = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.fillStyle = color;
    const density = size * 3;
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * size;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  };

  const drawLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = size * 2;
    } else if (tool === "pencil") {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, size / 2);
      ctx.globalAlpha = 0.85;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    if (tool === "bucket") {
      pushHistory();
      floodFill(pos.x, pos.y, color);
      return;
    }
    pushHistory();
    drawingRef.current = true;
    lastPosRef.current = pos;
    if (tool === "spray") drawSpray(pos.x, pos.y);
    else drawLine(pos, pos);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const pos = getPos(e);
    if (tool === "spray") drawSpray(pos.x, pos.y);
    else if (lastPosRef.current) drawLine(lastPosRef.current, pos);
    lastPosRef.current = pos;
  };

  const onPointerUp = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  const downloadPng = () => {
    const canvas = canvasRef.current!;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `meu-desenho-${Date.now()}.png`;
    link.click();
  };

  const downloadPdf = () => {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`meu-desenho-${Date.now()}.pdf`);
  };

  const saveToGallery = async () => {
    if (!user) {
      toast({ title: "Faça login para salvar 💾", description: "Vamos te levar pra tela de login." });
      navigate("/auth");
      return;
    }
    setSaving(true);
    try {
      const canvas = canvasRef.current!;
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png")!);
      const path = `${user.id}/${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("drawings").upload(path, blob, {
        contentType: "image/png",
      });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("drawings").insert({ user_id: user.id, image_path: path });
      if (dbErr) throw dbErr;
      toast({ title: "Salvo na galeria! 🖼️" });
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const tools: { id: Tool; label: string; icon: any }[] = [
    { id: "brush", label: "Pincel", icon: Brush },
    { id: "pencil", label: "Lápis", icon: Pencil },
    { id: "spray", label: "Spray", icon: SprayCan },
    { id: "bucket", label: "Balde", icon: PaintBucket },
    { id: "eraser", label: "Borracha", icon: Eraser },
  ];

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary font-body">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl">Colorir Online 🎨</h1>
          <Link to="/galeria" className="text-sm font-body text-primary hover:underline">Minha galeria</Link>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Tools panel */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-4 space-y-4 h-fit">
            <div>
              <p className="font-display text-sm mb-2">Ferramentas</p>
              <div className="grid grid-cols-3 gap-2">
                {tools.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTool(t.id)}
                      title={t.label}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        tool === t.id
                          ? "bg-primary text-primary-foreground border-primary shadow-playful"
                          : "bg-background border-border hover:border-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-body">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-display text-sm mb-2">Cores</p>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ background: c }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      color === c ? "border-foreground scale-110 shadow-playful" : "border-border"
                    }`}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="font-display text-sm mb-2">Tamanho: {size}px</p>
              <Slider value={[size]} min={1} max={40} step={1} onValueChange={(v) => setSize(v[0])} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={undo}>
                <Undo2 className="w-4 h-4" /> Desfazer
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={redo}>
                <Redo2 className="w-4 h-4" /> Refazer
              </Button>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <Button onClick={saveToGallery} disabled={saving} className="w-full font-display">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar na galeria
              </Button>
              <div className="flex gap-2">
                <Button onClick={downloadPng} variant="outline" size="sm" className="flex-1">
                  <ImageIcon className="w-4 h-4" /> PNG
                </Button>
                <Button onClick={downloadPdf} variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4" /> PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="bg-card rounded-2xl shadow-card border border-border p-4 flex items-center justify-center overflow-auto">
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="max-w-full rounded-xl border border-border touch-none cursor-crosshair bg-white"
              style={{ touchAction: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}