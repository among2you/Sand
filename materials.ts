export type MaterialType = 
  | 'empty' 
  | 'sand' 
  | 'water' 
  | 'stone' 
  | 'wood'
  | 'fire'
  | 'smoke'
  | 'oil'
  | 'acid'
  | 'lava';

interface Material {
  name: string;
  color: string;
  density: number;
  flammable?: boolean;
  spreads?: boolean;
  evaporates?: boolean;
  corrosive?: boolean;
}

export const Materials: Record<MaterialType, Material> = {
  empty: {
    name: 'Empty',
    color: '#000000',
    density: 0
  },
  sand: {
    name: 'Sand',
    color: '#e6c88c',
    density: 4
  },
  water: {
    name: 'Water',
    color: '#4a80f5',
    density: 2,
    spreads: true
  },
  stone: {
    name: 'Stone',
    color: '#808080',
    density: 5
  },
  wood: {
    name: 'Wood',
    color: '#8b4513',
    density: 3,
    flammable: true
  },
  fire: {
    name: 'Fire',
    color: '#ff4500',
    density: 0,
    evaporates: true
  },
  smoke: {
    name: 'Smoke',
    color: '#555555',
    density: -1,
    evaporates: true
  },
  oil: {
    name: 'Oil',
    color: '#8b4513',
    density: 1.5,
    flammable: true,
    spreads: true
  },
  acid: {
    name: 'Acid',
    color: '#32cd32',
    density: 3,
    corrosive: true,
    spreads: true
  },
  lava: {
    name: 'Lava',
    color: '#ff4500',
    density: 4,
    spreads: true
  }
};

export function initializeGrid(width: number, height: number): MaterialType[][] {
  return Array(height).fill(null).map(() => 
    Array(width).fill('empty')
  );
}

export function updateGrid(grid: MaterialType[][]): MaterialType[][] {
  const height = grid.length;
  const width = grid[0].length;
  const newGrid = grid.map(row => [...row]);

  // Update from bottom to top, right to left
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const current = grid[y][x];
      if (current === 'empty') continue;

      const material = Materials[current];

      // Basic falling
      if (y < height - 1 && material.density > 0) {
        const below = grid[y + 1][x];
        if (below === 'empty' || (Materials[below].density < material.density && below !== 'stone')) {
          newGrid[y][x] = below;
          newGrid[y + 1][x] = current;
          continue;
        }

        // Spread to sides if material can spread
        if (material.spreads) {
          const directions = Math.random() < 0.5 ? [-1, 1] : [1, -1];
          for (const dx of directions) {
            if (x + dx >= 0 && x + dx < width && grid[y + 1][x + dx] === 'empty') {
              newGrid[y][x] = 'empty';
              newGrid[y + 1][x + dx] = current;
              break;
            }
          }
        }
      }

      // Special behaviors
      if (material.evaporates && Math.random() < 0.1) {
        newGrid[y][x] = 'empty';
      }

      if (material.corrosive && y < height - 1) {
        const below = grid[y + 1][x];
        if (below !== 'empty' && below !== 'acid' && Math.random() < 0.1) {
          newGrid[y + 1][x] = 'empty';
        }
      }

      // Fire behavior
      if (current === 'fire') {
        // Spread fire
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const newX = x + dx;
            const newY = y + dy;
            if (
              newX >= 0 && newX < width && 
              newY >= 0 && newY < height
            ) {
              const neighbor = grid[newY][newX];
              if (Materials[neighbor].flammable && Math.random() < 0.1) {
                newGrid[newY][newX] = 'fire';
              }
            }
          }
        }
        
        // Create smoke
        if (y > 0 && grid[y - 1][x] === 'empty' && Math.random() < 0.2) {
          newGrid[y - 1][x] = 'smoke';
        }
      }
    }
  }

  return newGrid;
}