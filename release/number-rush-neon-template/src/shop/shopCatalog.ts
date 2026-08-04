import type { PlayerInventory } from '../progression/progressionTypes';

export type ShopItemType = 'powerup' | 'theme' | 'coin_pack' | 'gem_pack';

export type ShopItem = {
  id: string;
  type: ShopItemType;
  name: string;
  description: string;
  icon: string;
  priceCurrency: 'coins' | 'gems';
  price: number;
  inventoryReward?: Partial<PlayerInventory>;
  themeId?: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'multi-1',
    type: 'powerup',
    name: 'MULTIPLIER ×1',
    description: 'Double a tile value once.',
    icon: 'x2',
    priceCurrency: 'coins',
    price: 150,
    inventoryReward: { multiplier: 1 },
  },
  {
    id: 'multi-5',
    type: 'powerup',
    name: 'MULTIPLIER PACK ×5',
    description: 'Bundle of five Multipliers.',
    icon: 'x2',
    priceCurrency: 'coins',
    price: 600,
    inventoryReward: { multiplier: 5 },
  },
  {
    id: 'swap-1',
    type: 'powerup',
    name: 'SWAP ×1',
    description: 'Swap two lane totals.',
    icon: '⇄',
    priceCurrency: 'coins',
    price: 200,
    inventoryReward: { swap: 1 },
  },
  {
    id: 'swap-5',
    type: 'powerup',
    name: 'SWAP PACK ×5',
    description: 'Bundle of five Swaps.',
    icon: '⇄',
    priceCurrency: 'coins',
    price: 800,
    inventoryReward: { swap: 5 },
  },
  {
    id: 'bomb-1',
    type: 'powerup',
    name: 'BOMB TILE ×1',
    description: 'Coming to gameplay soon.',
    icon: '●',
    priceCurrency: 'coins',
    price: 300,
    inventoryReward: { bomb: 1 },
  },
  {
    id: 'freeze-1',
    type: 'powerup',
    name: 'FREEZE CARD ×1',
    description: 'Coming to gameplay soon.',
    icon: '❄',
    priceCurrency: 'coins',
    price: 250,
    inventoryReward: { freeze: 1 },
  },
  {
    id: 'shield-1',
    type: 'powerup',
    name: 'SHIELD ×1',
    description: 'Coming to gameplay soon.',
    icon: '◈',
    priceCurrency: 'coins',
    price: 350,
    inventoryReward: { shield: 1 },
  },
  {
    id: 'wild-1',
    type: 'powerup',
    name: 'WILD TILE ×1',
    description: 'Coming to gameplay soon.',
    icon: '★',
    priceCurrency: 'gems',
    price: 20,
    inventoryReward: { wild: 1 },
  },
  {
    id: 'theme-solar',
    type: 'theme',
    name: 'SOLAR BLAZE',
    description: 'Orange heat theme pack.',
    icon: '☀',
    priceCurrency: 'coins',
    price: 3000,
    themeId: 'solar-blaze',
  },
  {
    id: 'theme-void',
    type: 'theme',
    name: 'VOID PURPLE',
    description: 'Deep purple neon theme.',
    icon: '◆',
    priceCurrency: 'gems',
    price: 50,
    themeId: 'void-purple',
  },
];

export function getShopItemsByType(type: ShopItemType): ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.type === type);
}
