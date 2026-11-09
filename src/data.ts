export type Character = { id: string; name: string; species: string; className: string; level: number; hp: number; maxHp: number; ac: number; abilities: string; weapons: string; spells: string; equipment: string; features: string; portrait: string };
export type Session = { id: string; title: string; date: string; summary: string };
export type Campaign = { name: string; setting: string; location: string; story: string; quests: string; completed: string; npcs: string; enemies: string; discoveries: string; houseRules: string; inventory: string; dmNotes: string };

export const sampleCampaign: Campaign = {
  name: 'The Embervale Chronicle', setting: 'The misty borderlands of Embervale', location: 'The village of Briar Glen',
  story: 'Strange lights have appeared above the old mine. The party is looking for the missing cartographer.',
  quests: 'Find Elian the cartographer\nInvestigate the old mine', completed: 'Escort the herb merchant to Briar Glen',
  npcs: 'Mara Thorn — innkeeper, helpful\nElian Vale — missing cartographer', enemies: 'Restless skeletons near the mine',
  discoveries: 'A silver key marked with a crescent moon', houseRules: 'The DM makes the final call on unclear rules.',
  inventory: 'Silver crescent key\n2 healing potions', dmNotes: 'Fictional demo note: the key opens the observatory vault.'
};

export const sampleCharacters: Character[] = [
  { id: '1', name: 'Rowan Ashford', species: 'Human', className: 'Fighter', level: 3, hp: 25, maxHp: 28, ac: 17, abilities: 'STR 16 · DEX 12 · CON 14 · INT 10 · WIS 11 · CHA 9', weapons: 'Longsword, light crossbow', spells: 'None', equipment: 'Chain mail, shield, explorer’s pack', features: 'Action Surge, Second Wind', portrait: '⚔' },
  { id: '2', name: 'Lyra Moonbrook', species: 'Elf', className: 'Wizard', level: 3, hp: 15, maxHp: 18, ac: 12, abilities: 'STR 8 · DEX 14 · CON 12 · INT 17 · WIS 13 · CHA 10', weapons: 'Quarterstaff, dagger', spells: 'Magic Missile, Shield, Detect Magic', equipment: 'Spellbook, component pouch', features: 'Arcane Recovery', portrait: '✦' },
  { id: '3', name: 'Bram Underbough', species: 'Halfling', className: 'Rogue', level: 3, hp: 20, maxHp: 21, ac: 14, abilities: 'STR 9 · DEX 17 · CON 13 · INT 12 · WIS 12 · CHA 14', weapons: 'Shortbow, daggers', spells: 'None', equipment: 'Thieves’ tools, leather armor', features: 'Sneak Attack, Cunning Action', portrait: '◆' }
];

export const sampleSessions: Session[] = [
  { id: 's1', title: 'The Road to Briar Glen', date: '2026-10-18', summary: 'The party escorted an herb merchant to Briar Glen and heard rumors of strange lights above the old mine. Mara Thorn offered them a room at her inn.' },
  { id: 's2', title: 'Whispers Beneath the Hill', date: '2026-10-25', summary: 'The party entered the old mine, defeated three skeletons, and found a silver key marked with a crescent moon. They learned that Elian the cartographer may have gone deeper underground.' }
];

export const ruleCards = [
  { title: 'Combat turn structure', category: 'Combat', text: 'On your turn, you can move up to your speed and take one action. Some features also allow a bonus action. You may split movement around your action.' },
  { title: 'Actions', category: 'Actions', text: 'Common actions include Attack, Dash, Disengage, Dodge, Help, Hide, Ready, Search, and Use an Object or Utilize. Ask your DM about unusual actions.' },
  { title: 'Bonus actions', category: 'Bonus actions', text: 'You can take a bonus action only when a feature, spell, or other rule gives you one. You get at most one on your turn.' },
  { title: 'Reactions', category: 'Reactions', text: 'A reaction is a quick response to a trigger. You normally get one until the start of your next turn.' },
  { title: 'Movement', category: 'Movement', text: 'You can move up to your speed on your turn. Difficult terrain usually costs extra movement.' },
  { title: 'Advantage and disadvantage', category: 'Ability checks', text: 'Roll two d20s. With advantage use the higher; with disadvantage use the lower. They cancel if you have both.' },
  { title: 'Opportunity attacks', category: 'Combat', text: 'A creature may use its reaction to make a melee attack when a hostile creature leaves its reach. Disengage can prevent this.' },
  { title: 'Death saving throws', category: 'Saving throws', text: 'At 0 hit points, make a death save at the start of each turn. Three successes stabilize you; three failures mean death. A natural 20 restores 1 HP.' },
  { title: 'Short rests', category: 'Resting', text: 'A short rest is at least one hour. You can spend Hit Dice to regain hit points.' },
  { title: 'Long rests', category: 'Resting', text: 'A long rest is at least eight hours. It restores hit points and some spent resources, subject to your edition’s rules.' },
  { title: 'Spellcasting basics', category: 'Spellcasting', text: 'Check the spell’s casting time, range, components, duration, and available spell slots. Concentration limits you to one concentration spell at a time.' },
  { title: 'Common conditions', category: 'Conditions', text: 'Conditions such as Blinded, Frightened, Grappled, Poisoned, and Prone change what a creature can do. Check the full rule when one applies.' },
  { title: 'Healing', category: 'Healing', text: 'Healing restores hit points up to your maximum. Temporary hit points are separate and do not stack.' },
  { title: 'Equipment', category: 'Equipment', text: 'Weapons, armor, and tools list their own properties and requirements. Check proficiency before adding your proficiency bonus.' }
];
