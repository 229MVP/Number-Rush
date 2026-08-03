import type { PlayerInventory } from '../progression/progressionTypes';
import type { PowerUpId } from './gameTypes';

export type RunPowerInventory = Pick<
  PlayerInventory,
  'multiplier' | 'swap' | 'bomb' | 'freeze' | 'shield' | 'wild'
>;

export function toRunPowerInventory(
  inventory: PlayerInventory,
): RunPowerInventory {
  return {
    multiplier: Math.max(0, inventory.multiplier),
    swap: Math.max(0, inventory.swap),
    bomb: Math.max(0, inventory.bomb),
    freeze: Math.max(0, inventory.freeze),
    shield: Math.max(0, inventory.shield),
    wild: Math.max(0, inventory.wild),
  };
}

/** Centralized safe inventory delta apply for power-up consumption. */
export function consumePowerQuantity(
  qty: number,
  amount = 1,
): number {
  return Math.max(0, qty - Math.max(0, Math.floor(amount)));
}

export function inventoryKeyForPower(id: PowerUpId): keyof PlayerInventory {
  return id;
}
