import React, { useRef, useState } from 'react';

export const PincelMagico = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [estiloAtual, setEstiloAtual] = useState('livre');

  // Função mecânica: Desenhar na tela
  const desenhar = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || e.buttons !== 1) return;

    ctx.fillStyle = "#FF69B4"; // Rosa dos seus botões!
    ctx.beginPath();
    ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  // Função mágica local: Transforma os pixels usando matemática visual
  const aplicarFiltroEstilo = (tipo: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Exemplo de manipulação matemática (Filtro Pop Art / Estilizado rápido)
    for (let i = 0; i < data.length; i += 4) {
      if (tipo === 'surrealista') {
        data[i] = 255 - data[i];     // Inverte o Canal Vermelho
        data[i + 1] = data[i + 1];   // Mantém o Verde
        data[i + 2] = 255;           // Maximiza o Azul para dar tom de sonho
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    setEstiloAtual(tipo);
  };

  return (
    <div style={{ textAlign: 'center', background: '#FFFDF0', padding: '20px' }}>
      <h2>Painel de Criação do Candinho</h2>
      
      {/* 1. O ESPAÇO MECÂNICO: Desenho e Releitura */}
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={500} 
        onMouseMove={desenhar}
        style={{ border: '3px solid #FF69B4', borderRadius: '15px', cursor: 'crosshair', background: '#fff' }}
      />

      {/* 2. O TOQUE MÁGICO: Filtros de Arte Locais e Ecológicos */}
      <div style={{ marginTop: '15px' }}>
        <button onClick={() => aplicarFiltroEstilo('surrealista')} style={botaoEstilo}>
          ✨ Pincel Mágico (Surrealismo)
        </button>
        <button onClick={() => {
          const ctx = canvasRef.current?.getContext('2d');
          ctx?.clearRect(0, 0, 500, 500);
        }} style={botaoLimpar}>
          Apagar Tudo
        </button>
      </div>
    </div>
  );
};

// Estilos rápidos simulando a sua identidade visual
const botaoEstilo = { background: '#FF69B4', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', margin: '5px', cursor: 'pointer' };
const botaoLimpar = { background: '#ccc', color: '#333', border: 'none', padding: '10px 20px', borderRadius: '20px', margin: '5px', cursor: 'pointer' };
