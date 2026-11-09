import type { Campaign, Character, Session } from '../data';

export type OracleContext = { campaign: Campaign; characters: Character[]; sessions: Session[]; edition: '2014' | '2024'; detailed: boolean; ruling: boolean };

export function mockAnswer(question: string, context: OracleContext) {
  const q = question.toLowerCase();
  const character = context.characters.find(c => q.includes(c.name.toLowerCase().split(' ')[0]));
  const source = `SRD ${context.edition === '2014' ? '5.1' : '5.2.1'}`;
  let answer = '';
  let reference = '';
  if (/last session|previous session|what happened|recap/.test(q)) {
    const last = context.sessions[context.sessions.length - 1];
    answer = last ? `Previously on our adventure: ${last.summary}` : 'No sessions have been saved yet.';
    reference = last ? `Campaign journal · ${last.title}` : '';
  } else if (character && /health|hit points|\bhp\b/.test(q)) {
    answer = `${character.name} has ${character.hp} of ${character.maxHp} hit points in the current demo roster.`;
    reference = 'Party roster';
  } else if (/attack twice|extra attack/.test(q)) {
    answer = character ? `${character.name} is a level ${character.level} ${character.className}. The Attack action usually grants one attack unless a feature says otherwise; check the character’s features for Extra Attack.` : 'Most characters make one attack with the Attack action unless a feature such as Extra Attack says otherwise. Tell me the character’s class and level and I can check the party roster.';
    reference = `${source} · Combat / class features`;
  } else if (/move after|attack.*run|run.*attack/.test(q)) {
    answer = 'Yes, you can usually use remaining movement after attacking. Leaving an enemy’s reach may provoke an opportunity attack unless you Disengage or another rule prevents it.';
    reference = `${source} · Movement and opportunity attacks`;
  } else if (/natural 20|nat 20|critical hit/.test(q)) {
    answer = 'On an attack roll, a natural 20 hits regardless of the target’s AC and is a critical hit. Roll the attack’s damage dice twice, then add modifiers once.';
    reference = `${source} · Attack rolls`;
  } else if (/skeleton|sword|bludgeoning/.test(q)) {
    answer = 'A sword does not automatically grant advantage against a skeleton. Check that creature’s stat block for damage vulnerabilities or resistances; the DM can confirm which version you are facing.';
    reference = `${source} · Monster stat blocks`;
  } else if (/spell.*attack|attack.*spell/.test(q)) {
    answer = 'It depends on the spell’s casting time and what actions you have available. Tell me which spell and class feature you mean, and check the spellcasting rules for your chosen edition.';
    reference = `${source} · Spellcasting`;
  } else if (/quest|location|inventory|house rule/.test(q)) {
    answer = `From the demo campaign: the party is at ${context.campaign.location}. Active quests: ${context.campaign.quests.split('\n').join('; ')}. House rules: ${context.campaign.houseRules}`;
    reference = 'Campaign notes';
  } else {
    answer = `I don't have enough information in the demo notes to answer that confidently. Try a more specific rules question, or check the ${source} reference. Your DM has the final say.`;
    reference = `${source} · General reference`;
  }
  if (context.ruling) answer += ' Suggested ruling: use the simplest interpretation that keeps the turn moving, then confirm with the DM.';
  if (context.detailed) answer += ' If a class feature, spell description, monster stat block, or house rule says something more specific, follow that text for your game.';
  return { answer, reference };
}
