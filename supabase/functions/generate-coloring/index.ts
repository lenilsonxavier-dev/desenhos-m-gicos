import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Banco de dados local de molduras de arte (imagens em preto e branco para preencher)
// Você deve salvar essas imagens na pasta 'public/molduras/' do seu app no GitHub/Vercel
const MOLDURAS_ARTE = [
  {
    id: "abaporu",
    keywords: ["tarsila", "abaporu", "nordeste", "pé grande", "cacto", "homem"],
    url: "https://candinhodesenhista.vercel.app/molduras/abaporu_contorno.png"
  },
  {
    id: "pipas",
    keywords: ["portinari", "pipa", "menino", "brincadeira", "infância", "criança"],
    url: "https://candinhodesenhista.vercel.app/molduras/meninos_pipas_contorno.png"
  },
  {
    id: "girassois",
    keywords: ["van gogh", "girassol", "flor", "vaso", "amarelo", "natureza"],
    url: "https://candinhodesenhista.vercel.app/molduras/girassois_contorno.png"
  },
  {
    id: "relogio",
    keywords: ["dali", "relógio", "derretido", "tempo", "surrealismo", "sonho"],
    url: "https://candinhodesenhista.vercel.app/molduras/relogios_derretidos_contorno.png"
  }
];

serve(async (req) => {
  // Trata o protocolo CORS para o React conseguir conversar com a função
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "O que vamos colorir hoje? 🎨" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const busca = prompt.toLowerCase().trim();

    // 1. Tenta encontrar uma moldura de mestre que combine com o que a criança digitou
    const molduraEncontrada = MOLDURAS_ARTE.find(item => 
      item.keywords.some(palavra => busca.includes(palavra)) || busca.includes(item.id)
    );

    let imageUrl = "";

    if (molduraEncontrada) {
      imageUrl = molduraEncontrada.url;
    } else {
      // 2. Se a criança digitar algo genérico (ex: "gato"), pegamos uma moldura surpresa 
      // para ela conhecer um grande pintor!
      const indiceAleatorio = Math.floor(Math.random() * MOLDURAS_ARTE.length);
      imageUrl = MOLDURAS_ARTE[indiceAleatorio].url;
    }

    // Retorna a URL da imagem local de forma instantânea
    return new Response(JSON.stringify({ imageUrl, ecoFriendly: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Opa, o pincel falhou! Vamos tentar de novo? 🖍️" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
