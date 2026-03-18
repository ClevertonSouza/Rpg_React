export default function Header({ char, onChange }) {
  return (
    <div className="header">
      <div className="char-name">{char.name}</div>
      <div className="char-sub">
        {char.class} — Subclasse: {char.subclass} &nbsp;|&nbsp; Nível {char.level} &nbsp;|&nbsp; {char.race}
      </div>
    </div>
  );
}
