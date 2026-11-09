import type { Campaign, Character, Session } from '../data';

export type OracleContext = { campaign: Campaign; characters: Character[]; sessions: Session[]; edition: '2014' | '2024'; detailed: boolean; ruling: boolean };

export async function askOracle(question: string, context: OracleContext, onText: (text: string) => void) {
  const endpoint = import.meta.env.VITE_ORACLE_API_URL;
  if (!endpoint) {
    await new Promise(resolve => setTimeout(resolve, 420));
    const result = mockAnswer(question, context);
    onText(result.answer);
    return result.reference;
  }

  const response = await fetch(`${endpoint.replace(/\/$/, '')}/oracle`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, edition: context.edition, detailed: context.detailed, ruling: context.ruling })
  });
  if (!response.ok || !response.body) throw new Error(`Oracle unavailable (${response.status}). Try again later.`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const eventText of events) {
      const data = eventText.split('\n').filter(line => line.startsWith('data: ')).map(line => line.slice(6)).join('\n');
      if (!data || data === '[DONE]') continue;
      try {
        const event = JSON.parse(data);
        if (event.type === 'response.output_text.delta') { answer += event.delta; onText(answer); }
        if (event.type === 'error' || event.type === 'response.failed') throw new Error('The Oracle could not finish this answer.');
      } catch (error) {
        if (error instanceof SyntaxError) continue;
        throw error;
      }
    }
  }
  if (!answer) throw new Error('The Oracle returned an empty answer.');
  return `Campaign notes · SRD ${context.edition === '2014' ? '5.1' : '5.2.1'}`;
}

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
