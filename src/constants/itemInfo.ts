export const CATEGORIES = ['Wondrous Item', 'Weapon', 'Armor', 'Potion'] as const;
export type Category = typeof CATEGORIES[number];

export const TYPES: Record<Category, string[]> = {
    'Wondrous Item': ['Ring', 'Staff', 'Wand', 'Clothing'],
    'Weapon': ['Longsword', 'Shortsword', 'Dagger', 'Greataxe', 'Shortsword', 'Bow', 'Crossbow', 'Mace', 'Flail', 'Rapier', 'Spear', 'Glaive', 'Pike', 'Halberd', 'Scimitar', 'Trident', 'Whip', 'Greatsword', 'Maul', 'Quarterstaff', 'Club', 'Handaxe', 'Light Hammer', 'Morningstar', 'Net', 'Longbow', 'Heavy Crossbow', 'Light Crossbow', 'Shortbow', 'Hand Crossbow'],
    'Armor': ['Light', 'Medium', 'Heavy', 'Shield'],
    'Potion': ['Healing', 'Other']
}

export const DIE_SIZES = [0,4,6,8,10,12] as const;

export const getFieldLocks = (category: Category | '') => {
    if (!category) return { dieLocked: false, acLocked: false, bonusLocked: false };

    return {
        dieLocked: category !== 'Weapon',
        acLocked: category !== 'Armor',
        bonusLocked: category === 'Potion',
    } 
}