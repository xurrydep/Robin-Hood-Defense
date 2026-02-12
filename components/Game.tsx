
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Enemy, Arrow } from '../types';

interface GameProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameOver: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const requestRef = useRef<number>();
  const lastEnemySpawn = useRef<number>(0);

  const SPAWN_INTERVAL = 2200;
  const PLAYER_X = 80;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  const spawnEnemy = useCallback(() => {
    const types: ('soldier' | 'knight' | 'giant')[] = ['soldier', 'knight', 'giant'];
    const type = types[Math.floor(Math.random() * 3)];
    
    let stats = { health: 2, speed: 1.6 };
    if (type === 'knight') stats = { health: 6, speed: 1.0 };
    if (type === 'giant') stats = { health: 18, speed: 0.5 };

    const newEnemy: Enemy = {
      id: Date.now() + Math.random(),
      x: CANVAS_WIDTH + 60,
      y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
      speed: stats.speed + (gameState.level * 0.12),
      health: stats.health,
      maxHealth: stats.health,
      type
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, [gameState.level]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const targetY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const dx = targetX - PLAYER_X;
    const dy = targetY - (CANVAS_HEIGHT / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 14;
    setArrows(prev => [...prev, { x: PLAYER_X + 20, y: CANVAS_HEIGHT / 2, vx: (dx / dist) * speed, vy: (dy / dist) * speed }]);
  };

  const update = useCallback((time: number) => {
    if (gameState.isGameOver) return;

    if (time - lastEnemySpawn.current > SPAWN_INTERVAL / (1 + (gameState.level - 1) * 0.15)) {
      spawnEnemy();
      lastEnemySpawn.current = time;
    }

    setArrows(prev => prev.map(a => ({ ...a, x: a.x + a.vx, y: a.y + a.vy })).filter(a => a.x > 0 && a.x < CANVAS_WIDTH && a.y > 0 && a.y < CANVAS_HEIGHT));

    setEnemies(prevEnemies => {
      const remainingEnemies: Enemy[] = [];
      let castleHitCount = 0;

      for (const enemy of prevEnemies) {
        let updatedEnemy = { ...enemy, x: enemy.x - enemy.speed };
        
        if (updatedEnemy.x < PLAYER_X + 10) {
          castleHitCount++;
          continue;
        }

        setArrows(prevArrows => {
          let hasHit = false;
          const remainingArrows = prevArrows.filter(arrow => {
            const hitZone = enemy.type === 'giant' ? 45 : 25;
            const dist = Math.sqrt(Math.pow(arrow.x - updatedEnemy.x, 2) + Math.pow(arrow.y - updatedEnemy.y, 2));
            if (dist < hitZone && !hasHit) {
              updatedEnemy.health -= 1;
              hasHit = true;
              return false;
            }
            return true;
          });
          return remainingArrows;
        });

        if (updatedEnemy.health > 0) {
          remainingEnemies.push(updatedEnemy);
        } else {
          setGameState(gs => ({ 
            ...gs, 
            score: gs.score + (enemy.type === 'giant' ? 250 : enemy.type === 'knight' ? 80 : 30),
            level: Math.floor((gs.score + 50) / 400) + 1
          }));
        }
      }

      if (castleHitCount > 0) {
        setGameState(gs => {
          const damage = gs.isContractDeployed ? 4 * castleHitCount : 12 * castleHitCount;
          const newHealth = Math.max(0, gs.health - damage);
          if (newHealth <= 0 && !gs.isGameOver) {
            onGameOver(gs.score);
            return { ...gs, health: 0, isGameOver: true };
          }
          return { ...gs, health: newHealth };
        });
      }

      return remainingEnemies;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState.isGameOver, gameState.level, gameState.isContractDeployed, onGameOver, spawnEnemy, setGameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  // Drawing helpers
  const drawArcher = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Cape/Body
    ctx.fillStyle = '#14532d'; // Dark Forest Green
    ctx.beginPath();
    ctx.moveTo(-15, 25);
    ctx.lineTo(15, 25);
    ctx.lineTo(5, -15);
    ctx.lineTo(-5, -15);
    ctx.closePath();
    ctx.fill();

    // Head/Hood
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(0, -22, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Face shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0.2, Math.PI - 0.2);
    ctx.fill();

    // Bow
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(15, 0, 25, -Math.PI/2, Math.PI/2);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, -25);
    ctx.lineTo(15, 25);
    ctx.stroke();

    ctx.restore();
  };

  const drawOrc = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number, type: string) => {
    ctx.save();
    ctx.translate(x, y);
    
    const time = Date.now() / 150;
    const wobble = Math.sin(time) * 2;

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    if (type === 'giant') {
      // Troll shape
      ctx.moveTo(-size, size);
      ctx.quadraticCurveTo(0, -size * 1.5, size, size);
      ctx.lineTo(-size, size);
    } else {
      // Orc shape
      ctx.arc(0, wobble, size, 0, Math.PI * 2);
    }
    ctx.fill();

    // Jagged Armor Bits
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - 5, -5);
    ctx.lineTo(-size, -10);
    ctx.stroke();

    // Helmet (Crude metal)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-size - 2, -size/2);
    ctx.lineTo(size + 2, -size/2);
    ctx.lineTo(0, -size * 1.4);
    ctx.closePath();
    ctx.fill();

    // Glowing Red Eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(-size/3, wobble - size/4, 2, 0, Math.PI * 2);
    ctx.arc(size/3, wobble - size/4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Weapon
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - (type === 'giant' ? 40 : 15), 10 + wobble);
    ctx.stroke();
    
    // Uruk-hai White Hand (Knight only)
    if (type === 'knight') {
       ctx.fillStyle = '#fff';
       ctx.globalAlpha = 0.7;
       ctx.beginPath();
       ctx.arc(0, 0, 5, 0, Math.PI*2);
       ctx.fill();
       ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background - Mordor/Sherwood Hybrid
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#020617');
    gradient.addColorStop(1, '#052e16');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Mist effect
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#94a3b8';
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.arc((Date.now()/50 + i*200)%CANVAS_WIDTH, 100 + i*80, 100, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Path
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 80, CANVAS_WIDTH, 340);

    // Castle Wall
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 75, CANVAS_HEIGHT);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.strokeRect(0, i, 75, 40);
      ctx.fillStyle = '#020617';
      ctx.fillRect(60, i + 5, 10, 10); // Arrow slits
    }

    // Shield
    if (gameState.isContractDeployed) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.2 + Math.abs(Math.sin(Date.now() / 400)) * 0.2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#60a5fa';
      ctx.moveTo(85, 0);
      ctx.lineTo(85, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();
    }

    // Player (Realistic Archer)
    drawArcher(ctx, PLAYER_X, CANVAS_HEIGHT / 2);

    // Arrows
    arrows.forEach(arrow => {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrow.x, arrow.y);
      ctx.lineTo(arrow.x - arrow.vx * 1.5, arrow.y - arrow.vy * 1.5);
      ctx.stroke();
      // Arrow head
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(arrow.x, arrow.y, 2, 0, Math.PI*2);
      ctx.fill();
    });

    // Enemies (LotR Monsters)
    enemies.forEach(enemy => {
      let color = '#450a0a'; // Orc skin
      let size = 20;
      if (enemy.type === 'knight') {
          color = '#1e293b'; // Uruk plate
          size = 26;
      } else if (enemy.type === 'giant') {
          color = '#3f3f46'; // Troll grey
          size = 50;
      }
      drawOrc(ctx, enemy.x, enemy.y, color, size, enemy.type);
      
      // Health UI
      const hpWidth = size * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(enemy.x - size, enemy.y - size - 20, hpWidth, 4);
      ctx.fillStyle = enemy.health < enemy.maxHealth * 0.3 ? '#ef4444' : '#22c55e';
      ctx.fillRect(enemy.x - size, enemy.y - size - 20, hpWidth * (enemy.health / enemy.maxHealth), 4);
    });

    // UI
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'black';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px MedievalSharp';
    ctx.fillText(`BOUNTY: ${gameState.score} ETH`, 100, 45);
    ctx.font = '14px Inter';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`SIEGE WAVE: ${gameState.level}`, 100, 70);
    ctx.shadowBlur = 0;

    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 60px MedievalSharp';
      ctx.textAlign = 'center';
      ctx.fillText('SHERWOOD HAS FALLEN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px Inter';
      ctx.fillText(`Your bravery earned ${gameState.score} Testnet ETH`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
  }, [arrows, enemies, gameState]);

  return (
    <div className="relative cursor-crosshair">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        onClick={handleCanvasClick}
        className="block w-full h-auto aspect-[16/10] bg-black"
      />
    </div>
  );
};

export default Game;
