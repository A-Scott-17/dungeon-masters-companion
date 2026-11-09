import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, CircleHelp, Crown, Dice5, Menu, Mic, MoonStar, Plus, ScrollText, Send, Shield, Sparkles, Swords, Trash2, Users, X } from 'lucide-react';
import { ruleCards, sampleCampaign, sampleCharacters, sampleSessions, type Campaign, type Character, type Session } from './data';
import { mockAnswer } from './services/oracle';

type Page = 'oracle' | 'party' | 'journal' | 'dice' | 'rules' | 'initiative' | 'dm';
type Message = { id: string; role: 'you' | 'oracle'; text: string; reference?: string };
type Combatant = { id: string; name: string; initiative: number; kind: 'hero' | 'enemy' };
const uid = () => crypto.randomUUID();
const readLocal = <T,>(key: string, fallback: T): T => { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback; } catch { return fallback; } };
const nav: { id: Page; label: string; icon: typeof Sparkles }[] = [
  { id: 'oracle', label: 'Ask the Oracle', icon: Sparkles }, { id: 'party', label: 'Party Members', icon: Users },
  { id: 'journal', label: 'Campaign Journal', icon: BookOpen }, { id: 'dice', label: 'Dice Roller', icon: Dice5 },
  { id: 'rules', label: 'Quick Rules', icon: ScrollText }, { id: 'initiative', label: 'Initiative Tracker', icon: Swords },
  { id: 'dm', label: 'DM Mode', icon: Crown }
];

function App() {
  const [page, setPage] = useState<Page>('oracle');
  const [menuOpen, setMenuOpen] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>(() => readLocal('dmc-campaign', sampleCampaign));
  const [characters, setCharacters] = useState<Character[]>(() => readLocal('dmc-characters', sampleCharacters));
  const [sessions, setSessions] = useState<Session[]>(() => readLocal('dmc-sessions', sampleSessions));
  const [edition, setEdition] = useState<'2014' | '2024'>(() => readLocal('dmc-edition', '2024'));
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'oracle', text: 'Greetings, adventurer. Ask me about a rule, a party member, or what happened last session. I’m using fictional demo notes for now.' }]);
  const [question, setQuestion] = useState('');
  const [detailed, setDetailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rollExpression, setRollExpression] = useState('1d20+3');
  const [rollResult, setRollResult] = useState<{ rolls: number[]; modifier: number; total: number } | null>(null);
  const [rollError, setRollError] = useState('');
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [combatName, setCombatName] = useState('');
  const [combatRoll, setCombatRoll] = useState('');
  const [combatKind, setCombatKind] = useState<'hero' | 'enemy'>('hero');
  const [turn, setTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [recap, setRecap] = useState('');
  const [recapTitle, setRecapTitle] = useState('');
  const [suggestions, setSuggestions] = useState<{ field: keyof Campaign; value: string }[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number[]>([]);
  const [dmTab, setDmTab] = useState<'campaign' | 'party' | 'recap'>('campaign');
  const [notice, setNotice] = useState('');
  const [tavern, setTavern] = useState('The Copper Griffin');
  const [encounter, setEncounter] = useState('A merchant offers a suspiciously cheap enchanted ring.');

  useEffect(() => localStorage.setItem('dmc-campaign', JSON.stringify(campaign)), [campaign]);
  useEffect(() => localStorage.setItem('dmc-characters', JSON.stringify(characters)), [characters]);
  useEffect(() => localStorage.setItem('dmc-sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('dmc-edition', JSON.stringify(edition)), [edition]);

  const changePage = (next: Page) => { setPage(next); setMenuOpen(false); window.scrollTo(0, 0); };
  const speak = (onText: (text: string) => void) => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice input is unavailable in this browser. You can type instead.'); return; }
    const recognition = new SpeechRecognition();
    recognition.onresult = event => onText(event.results[0][0].transcript);
    recognition.onerror = () => setNotice('Microphone input failed. Check browser permissions and try again.');
    recognition.start();
  };
  const ask = (ruling = false, text = question) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages(current => [...current, { id: uid(), role: 'you', text: trimmed }]);
    setQuestion(''); setLoading(true);
    window.setTimeout(() => {
      const response = mockAnswer(trimmed, { campaign, characters, sessions, edition, detailed, ruling });
      setMessages(current => [...current, { id: uid(), role: 'oracle', text: response.answer, reference: response.reference }]);
      setLoading(false);
    }, 420);
  };
  const roll = (expression = rollExpression) => {
    setRollExpression(expression);
    const match = /^\s*(\d{1,2})d(4|6|8|10|12|20|100)(?:\s*([+-])\s*(\d{1,3}))?\s*$/i.exec(expression);
    if (!match) { setRollError('Use an expression like 2d6+4 (up to 20 dice).'); setRollResult(null); return; }
    const count = Number(match[1]);
    if (count < 1 || count > 20) { setRollError('Roll between 1 and 20 dice.'); setRollResult(null); return; }
    const sides = Number(match[2]);
    const modifier = (match[3] === '-' ? -1 : 1) * Number(match[4] || 0);
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    setRollResult({ rolls, modifier, total: rolls.reduce((sum, value) => sum + value, modifier) }); setRollError('');
  };
  const addCombatant = () => {
    if (!combatName.trim() || combatRoll.trim() === '' || !Number.isFinite(Number(combatRoll))) { setNotice('Enter a name and a numeric initiative roll.'); return; }
    setCombatants(current => [...current, { id: uid(), name: combatName.trim(), initiative: Number(combatRoll), kind: combatKind }].sort((a, b) => b.initiative - a.initiative));
    setCombatName(''); setCombatRoll(''); setTurn(0);
  };
  const advance = () => { if (!combatants.length) return; if (turn + 1 >= combatants.length) { setTurn(0); setRound(current => current + 1); } else setTurn(current => current + 1); };
  const analyzeRecap = () => {
    if (!recap.trim()) { setNotice('Write a session summary first.'); return; }
    const found: { field: keyof Campaign; value: string }[] = [];
    const lines = recap.split(/[.!?\n]+/).map(line => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (/found|discovered|learned|revealed/i.test(line)) found.push({ field: 'discoveries', value: line });
      if (/met|spoke with|encountered/i.test(line)) found.push({ field: 'npcs', value: line });
      if (/quest|mission|task/i.test(line)) found.push({ field: 'quests', value: line });
      if (/obtained|picked up|took|received/i.test(line)) found.push({ field: 'inventory', value: line });
    }
    setSuggestions(found); setSelectedSuggestion([]);
    if (!found.length) setNotice('No clear campaign changes found. You can still save this recap.');
  };
  const saveRecap = () => {
    if (!recap.trim()) { setNotice('Write a session summary first.'); return; }
    const session: Session = { id: uid(), title: recapTitle.trim() || `Session ${sessions.length + 1}`, date: new Date().toISOString().slice(0, 10), summary: recap.trim() };
    setSessions(current => [...current, session]);
    setCampaign(current => { const next = { ...current }; selectedSuggestion.forEach(index => { const item = suggestions[index]; if (item) next[item.field] += `\n${item.value}`; }); return next; });
    setRecap(''); setRecapTitle(''); setSuggestions([]); setSelectedSuggestion([]);
    setNotice('Recap saved to this browser’s demo storage.');
  };

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark">✦</div><div><span className="brand-kicker">THE</span><strong>Dungeon Master’s<br/>Companion</strong></div><button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20}/></button></div>
      <div className="side-caption">YOUR ADVENTURE AWAITS</div>
      <nav aria-label="Main navigation">{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => changePage(item.id)}><item.icon size={18}/><span>{item.label}</span>{page === item.id && <ChevronRight size={15} className="nav-chevron"/>}</button>)}</nav>
      <div className="sidebar-bottom"><span className="status-dot"/> Demo campaign <small>Fictional notes · saved on this device</small></div>
    </aside>
    {menuOpen && <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu"/>}
    <main className="main"><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22}/></button><span className="breadcrumb">THE EMBERVALE CHRONICLE <span> / </span> {nav.find(item => item.id === page)?.label.toUpperCase()}</span><div className="top-controls"><label htmlFor="edition">RULES</label><select id="edition" value={edition} onChange={event => setEdition(event.target.value as '2014' | '2024')}><option value="2024">2024</option><option value="2014">2014</option></select><span className="demo-pill">DEMO MODE</span></div></header>
      <div className="content">
        {page === 'oracle' && <><div className="page-heading"><div className="eyebrow"><Sparkles size={15}/> YOUR GUIDE THROUGH THE UNKNOWN</div><h1>Ask the <em>Oracle</em></h1><p>Rules made clearer. Campaign memories kept close. The DM always has the final word.</p></div><div className="oracle-grid"><section className="panel chat-panel"><div className="panel-top"><div><span className="tiny-symbol">✧</span> THE ORACLE’S CHAMBER</div><span className="online"><span className="status-dot"/> Ready to help</span></div><div className="chat-history" aria-live="polite">{messages.map(message => <div key={message.id} className={`message ${message.role}`}><div className="message-avatar">{message.role === 'oracle' ? '✦' : 'Y'}</div><div className="message-body"><strong>{message.role === 'oracle' ? 'The Oracle' : 'You'}</strong><p>{message.text}</p>{message.reference && <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">↗ {message.reference}</a>}</div></div>)}{loading && <div className="message oracle"><div className="message-avatar">✦</div><div className="message-body"><strong>The Oracle</strong><p className="typing">Consulting the scrolls <span>● ● ●</span></p></div></div>}</div><div className="chat-compose"><div className="mode-row"><span>ANSWER STYLE</span><button className={!detailed ? 'selected' : ''} onClick={() => setDetailed(false)}>Quick answer</button><button className={detailed ? 'selected' : ''} onClick={() => setDetailed(true)}>Detailed answer</button></div><div className="input-row"><input value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') ask(); }} placeholder="Ask about rules, your party, or the story..." aria-label="Ask the Oracle"/><button className="icon-button" onClick={() => speak(text => setQuestion(current => `${current} ${text}`.trim()))} aria-label="Dictate question"><Mic size={19}/></button><button className="primary-button send-button" onClick={() => ask()} disabled={!question.trim() || loading}><Send size={16}/> Send</button></div><div className="compose-footer"><button onClick={() => ask(true)} disabled={!question.trim() || loading}><Sparkles size={14}/> Suggest a ruling</button><span>Mock answers · no API connected</span></div></div></section><aside className="oracle-aside"><div className="panel aside-card"><div className="card-icon"><BookOpen size={21}/></div><h3>Previously on our adventure...</h3><p>A quick reminder of where the story left off.</p><button className="text-button" onClick={() => ask(false, 'What happened in our last session?')}>Hear the recap <span>→</span></button></div><div className="panel aside-card"><div className="card-icon bronze"><CircleHelp size={21}/></div><h3>Try asking</h3>{['Can Rowan attack twice?', 'Can I move after attacking?', 'How much HP does Lyra have?'].map(prompt => <button key={prompt} className="prompt-link" onClick={() => ask(false, prompt)}>{prompt}<ChevronRight size={14}/></button>)}</div><div className="aside-note"><MoonStar size={17}/><span>When the ancient texts are unclear, your DM’s ruling lights the way.</span></div></aside></div></>}
        {page === 'party' && <><PageHead eyebrow="THE HEROES OF EMBERVALE" title="Party Members" subtitle="Every legend starts with a few brave souls."/><div className="character-grid">{characters.map(character => <article className="panel character-card" key={character.id}><div className="character-portrait">{character.portrait}</div><div className="character-main"><div className="character-class">LEVEL {character.level} {character.species.toUpperCase()} {character.className.toUpperCase()}</div><h2>{character.name}</h2><div className="stat-row"><span><b>{character.hp}</b> / {character.maxHp} HP</span><span><Shield size={15}/> AC {character.ac}</span></div><div className="hp-track"><span style={{ width: `${Math.max(0, Math.min(100, character.hp / character.maxHp * 100))}%` }}/></div><dl><dt>ABILITY SCORES</dt><dd>{character.abilities}</dd><dt>WEAPONS</dt><dd>{character.weapons}</dd><dt>SPELLS</dt><dd>{character.spells}</dd><dt>EQUIPMENT</dt><dd>{character.equipment}</dd><dt>SPECIAL ABILITIES</dt><dd>{character.features}</dd></dl></div></article>)}</div></>}
        {page === 'journal' && <><PageHead eyebrow="A CHRONICLE OF DEEDS" title="Campaign Journal" subtitle="The story so far, written into the pages of Embervale."/><div className="two-column"><div><div className="section-label">SESSION HISTORY</div>{[...sessions].reverse().map((session, index) => <article className="panel journal-entry" key={session.id}><span className="entry-number">CHAPTER {String(sessions.length - index).padStart(2, '0')}</span><time>{new Date(`${session.date}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</time><h2>{session.title}</h2><p>{session.summary}</p></article>)}</div><div><div className="section-label">CAMPAIGN AT A GLANCE</div><div className="panel info-panel"><Info label="CURRENT LOCATION" value={campaign.location}/><Info label="THE STORY" value={campaign.story}/><Info label="ACTIVE QUESTS" value={campaign.quests}/><Info label="IMPORTANT DISCOVERIES" value={campaign.discoveries}/></div><div className="panel generator-card"><h3>At the tavern</h3><p>{tavern}</p><button className="secondary-button" onClick={() => { const names = ['The Drunken Griffin','The Broken Sword','The Sleeping Dragon','The Crooked Wizard','The Rusty Tankard']; setTavern(names[Math.floor(Math.random()*names.length)]); }}>Another name</button></div><div className="panel generator-card"><h3>Encounter spark</h3><p>{encounter}</p><button className="secondary-button" onClick={() => { const ideas = ['A traveling merchant offers a suspiciously cheap magical ring.','A bridge keeper demands an unusual story as toll.','A wounded messenger carries a map with one place crossed out.','A flock of ravens follows the party through the fog.']; setEncounter(ideas[Math.floor(Math.random()*ideas.length)]); }}>Another idea</button><small>Ideas stay separate from campaign memory.</small></div></div></div></>}
        {page === 'dice' && <><PageHead eyebrow="LET FATE DECIDE" title="Dice Roller" subtitle="A little chance can change an entire adventure."/><div className="panel dice-panel"><div className="section-label">CHOOSE YOUR DIE</div><div className="dice-options">{[4,6,8,10,12,20,100].map(sides => <button key={sides} onClick={() => roll(`1d${sides}`)}><Dice5 size={23}/><span>D{sides}</span></button>)}</div><div className="section-label">OR WRITE A ROLL</div><div className="roll-input"><input value={rollExpression} onChange={event => setRollExpression(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') roll(); }} aria-label="Dice expression" placeholder="2d6+4"/><button className="primary-button" onClick={() => roll()}>Roll dice</button></div>{rollError && <p className="error">{rollError}</p>}{rollResult ? <div className="roll-result" aria-live="polite"><span>YOUR ROLL</span><div className="roll-total">{rollResult.total}</div><p>Dice: {rollResult.rolls.join(' + ')} {rollResult.modifier ? `${rollResult.modifier > 0 ? '+' : '−'} ${Math.abs(rollResult.modifier)}` : ''}</p></div> : <div className="empty-result">✧<p>Your fate awaits a roll.</p></div>}</div></>}
        {page === 'rules' && <><PageHead eyebrow="THE ADVENTURER’S REFERENCE" title="Quick Rules" subtitle="The essentials, close at hand when the table needs an answer."/><div className="rules-intro panel"><BookOpen size={22}/><p>Showing beginner summaries for <b>{edition} rules</b>. Editions can differ; consult the full SRD and your DM for exact wording.</p><a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">View official SRD ↗</a></div><div className="rules-grid">{ruleCards.map(rule => <details className="panel rule-card" key={rule.title}><summary><span>{rule.title}</span><Plus size={17}/></summary><p>{rule.text}</p><small>{rule.category} · SRD {edition === '2014' ? '5.1' : '5.2.1'} · <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">source</a></small></details>)}</div></>}
        {page === 'initiative' && <><PageHead eyebrow="WHEN SWORDS ARE DRAWN" title="Initiative Tracker" subtitle="Keep every turn clear, from first strike to final blow."/><div className="two-column initiative-layout"><section className="panel tracker-panel"><div className="panel-top">COMBAT ORDER <span>ROUND {round}</span></div>{combatants.length ? <ol className="combat-list">{combatants.map((combatant, index) => <li className={index === turn ? 'current-turn' : ''} key={combatant.id}><span className="turn-index">{index + 1}</span><span><b>{combatant.name}</b><small>{combatant.kind === 'hero' ? 'Party member' : 'Enemy'}</small></span><strong>{combatant.initiative}</strong><button onClick={() => { setCombatants(current => current.filter(item => item.id !== combatant.id)); setTurn(0); }} aria-label={`Remove ${combatant.name}`}><Trash2 size={16}/></button></li>)}</ol> : <div className="tracker-empty">Add a combatant to begin an encounter.</div>}<div className="tracker-actions"><button className="primary-button" onClick={advance} disabled={!combatants.length}>Next turn →</button><button className="secondary-button" onClick={() => { setCombatants([]); setTurn(0); setRound(1); }}>Reset combat</button></div></section><section className="panel add-panel"><div className="section-label">ADD A COMBATANT</div><label>Name<input value={combatName} onChange={event => setCombatName(event.target.value)} placeholder="Character or enemy"/></label><label>Initiative roll<input type="number" value={combatRoll} onChange={event => setCombatRoll(event.target.value)} placeholder="e.g. 16"/></label><label>Side<select value={combatKind} onChange={event => setCombatKind(event.target.value as 'hero'|'enemy')}><option value="hero">Party member</option><option value="enemy">Enemy</option></select></label><button className="primary-button" onClick={addCombatant}><Plus size={16}/> Add to combat</button><div className="quick-add">Quick add from party{characters.map(character => <button key={character.id} onClick={() => { setCombatName(character.name); setCombatKind('hero'); }}>{character.name} →</button>)}</div></section></div></>}
        {page === 'dm' && <><PageHead eyebrow="BEHIND THE SCREEN" title="DM Mode" subtitle="Shape the story, keep the record, and choose what becomes canon."/><div className="demo-warning"><Shield size={18}/><span>Demonstration only. Edits stay in this browser. Do not enter private campaign information until a secure backend and DM authentication are configured.</span></div><div className="tab-row"><button className={dmTab === 'campaign' ? 'active' : ''} onClick={() => setDmTab('campaign')}>Campaign notes</button><button className={dmTab === 'party' ? 'active' : ''} onClick={() => setDmTab('party')}>Characters</button><button className={dmTab === 'recap' ? 'active' : ''} onClick={() => setDmTab('recap')}>Session recap</button></div>{dmTab === 'campaign' && <div className="panel form-panel"><h2>Campaign information</h2><div className="form-grid">{(Object.keys(campaign) as (keyof Campaign)[]).map(key => <label key={key}>{({ name:'Campaign name',setting:'Setting',location:'Current location',story:'Current storyline',quests:'Active quests',completed:'Completed quests',npcs:'Important NPCs',enemies:'Known enemies',discoveries:'Discoveries',houseRules:'House rules',inventory:'Party inventory',dmNotes:'Private DM notes (demo only)' } as Record<keyof Campaign,string>)[key]}<textarea rows={key === 'story' || key === 'dmNotes' ? 3 : 2} value={campaign[key]} onChange={event => setCampaign(current => ({ ...current, [key]: event.target.value }))}/></label>)}</div><p className="field-note">Changes save automatically on this device.</p></div>}{dmTab === 'party' && <div className="panel form-panel"><h2>Character roster</h2>{characters.map(character => <div className="character-editor" key={character.id}><div className="editor-title"><h3>{character.name}</h3><button onClick={() => setCharacters(current => current.filter(item => item.id !== character.id))} aria-label={`Delete ${character.name}`}><Trash2 size={16}/></button></div><div className="form-grid">{(['name','species','className','level','hp','maxHp','ac','abilities','weapons','spells','equipment','features'] as (keyof Character)[]).map(key => <label key={key}>{key === 'className' ? 'Class' : key.replace(/([A-Z])/g, ' $1')}<input type={['level','hp','maxHp','ac'].includes(key) ? 'number' : 'text'} value={character[key]} onChange={event => setCharacters(current => current.map(item => item.id === character.id ? { ...item, [key]: ['level','hp','maxHp','ac'].includes(key) ? Number(event.target.value) : event.target.value } : item))}/></label>)}</div></div>)}<button className="secondary-button" onClick={() => setCharacters(current => [...current, { id: uid(), name: 'New Adventurer', species: 'Human', className: 'Fighter', level: 1, hp: 10, maxHp: 10, ac: 10, abilities: 'STR 10 · DEX 10 · CON 10 · INT 10 · WIS 10 · CHA 10', weapons: '—', spells: '—', equipment: '—', features: '—', portrait: '✦' }])}><Plus size={16}/> Add character</button></div>}{dmTab === 'recap' && <div className="panel form-panel"><h2>Record a session</h2><p>Write what actually happened. Suggested updates use only phrases from your summary and require your approval.</p><label>Session title<input value={recapTitle} onChange={event => setRecapTitle(event.target.value)} placeholder="e.g. The door beneath the hill"/></label><label>Session summary<textarea className="recap-textarea" value={recap} onChange={event => setRecap(event.target.value)} placeholder="What did the party do, find, and learn?"/></label><button className="voice-link" onClick={() => speak(text => setRecap(current => `${current} ${text}`.trim()))}><Mic size={16}/> Dictate summary</button><div className="form-actions"><button className="secondary-button" onClick={analyzeRecap}>Find suggested updates</button><button className="primary-button" onClick={saveRecap}>Save approved recap</button></div>{suggestions.length > 0 && <div className="suggestions"><h3>Review suggested updates</h3>{suggestions.map((item, index) => <label key={index}><input type="checkbox" checked={selectedSuggestion.includes(index)} onChange={() => setSelectedSuggestion(current => current.includes(index) ? current.filter(i => i !== index) : [...current, index])}/><span><b>{item.field}</b> · {item.value}</span></label>)}</div>}</div>}</>}
      </div><footer>✦ &nbsp; THE DUNGEON MASTER’S COMPANION <span>·</span> A place for stories worth remembering</footer>
    </main>{notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;
}

type SpeechRecognitionLike = { onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; start: () => void };
function PageHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) { return <div className="page-heading"><div className="eyebrow"><Sparkles size={15}/> {eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="info-item"><span>{label}</span><p>{value}</p></div>; }
export default App;
