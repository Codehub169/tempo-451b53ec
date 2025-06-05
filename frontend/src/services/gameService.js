import React from 'react';

// Mock data for games, aligning with HTML previews and Page component summaries
// In a real application, this might come from an API

const games = [
  {
    id: 'cosmicrush',
    name: 'Cosmic Rush',
    description: 'Navigate your ship through an asteroid field. How long can you survive?',
    thumbnailUrl: 'https://picsum.photos/seed/cosmicrush/400/300',
    controls: [
      { key: 'Left/Right Arrows', action: 'Steer Ship' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: React.lazy(() => import('../games/CosmicRushGame')),
  },
  {
    id: 'blockstacker',
    name: 'Block Stacker',
    description: 'Stack blocks perfectly to build the tallest tower. Precision is key!',
    thumbnailUrl: 'https://picsum.photos/seed/blockstacker/400/300',
    controls: [
      { key: 'Spacebar', action: 'Drop Block' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: React.lazy(() => import('../games/BlockStackerGame')),
  },
  {
    id: 'pixelpong',
    name: 'Pixel Pong',
    description: 'A modern twist on a classic. Challenge the AI or a friend!',
    thumbnailUrl: 'https://picsum.photos/seed/pixelpong/400/300',
    controls: [
      { key: 'W/S Keys', action: 'Player 1 Up/Down' },
      { key: 'Up/Down Arrows', action: 'Player 2 Up/Down (or AI)' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: React.lazy(() => import('../games/PixelPongGame')),
  },
  {
    id: 'memorymatch',
    name: 'Memory Match',
    description: 'Test your memory by matching pairs of cards against the clock.',
    thumbnailUrl: 'https://picsum.photos/seed/memorymatch/400/300',
    controls: [
      { key: 'Mouse Click', action: 'Flip Card' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: React.lazy(() => import('../games/MemoryMatchGame')),
  },
  {
    id: 'speedclicker',
    name: 'Speed Clicker',
    description: 'How many times can you click the target in 10 seconds? Test your reflexes!',
    thumbnailUrl: 'https://picsum.photos/seed/speedclicker/400/300',
    controls: [{ key: 'Mouse Click', action: 'Click Target' }],
    component: React.lazy(() => import('../games/SpeedClickerGame')),
  },
  {
    id: 'mazerunnerx',
    name: 'Maze Runner X',
    description: 'Navigate complex mazes. Find the exit before time runs out!',
    thumbnailUrl: 'https://picsum.photos/seed/mazerunner/400/300',
    controls: [
      { key: 'Arrow Keys', action: 'Move' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: React.lazy(() => import('../games/MazeRunnerXGame')),
  },
];

/**
 * Gets the list of all available games.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of game objects.
 */
const getGamesList = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200)); 
  return games;
};

/**
 * Gets the details for a specific game by its ID.
 * @param {string} gameId - The ID of the game.
 * @returns {Promise<object|null>} A promise that resolves to the game object or null if not found.
 */
const getGameDetails = async (gameId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const game = games.find(g => g.id === gameId);
  return game || null;
};

export const gameService = {
  getGamesList,
  getGameDetails,
  games, // Exporting raw games array for synchronous access if needed (e.g. for LeaderboardPage initial tabs)
};
