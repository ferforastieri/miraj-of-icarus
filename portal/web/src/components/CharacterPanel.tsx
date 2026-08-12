import {
  createCharacterAction,
  restoreCharacterAction,
  scheduleCharacterDeletionAction,
} from "@/app/actions";
import type { Character } from "@/lib/api";

const classes: Record<string, string> = {
  warrior: "Guerreiro",
  priest: "Sacerdote",
  wizard: "Mago",
  nature: "Naturalista",
  thief: "Ladino",
  guardian: "Guardião",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function CharacterPanel({ characters }: { characters: Character[] }) {
  return (
    <section className="panel-section" id="personagens" aria-labelledby="characters-title">
      <div className="panel-section-heading">
        <div>
          <p className="kicker">Até quatro viajantes</p>
          <h2 id="characters-title">Seus personagens</h2>
        </div>
        <span className="slot-count">{characters.length} / 4 slots</span>
      </div>

      <div className="character-grid">
        {characters.map((character) => (
          <article className={`character-card${character.deletionScheduledAt ? " character-deleting" : ""}`} key={character.id}>
            <div className="character-sigil" aria-hidden="true">{character.name.slice(0, 1)}</div>
            <div>
              <p className="character-class">{classes[character.archetype] ?? character.archetype} · Nível {character.level}</p>
              <h3>{character.name}</h3>
              <p className="character-meta">Criado em {formatDate(character.createdAt)}</p>
            </div>
            {character.deletionScheduledAt ? (
              <div className="deletion-state">
                <p>Bloqueado. Exclusão em {formatDate(character.deletionScheduledAt)}.</p>
                <form action={restoreCharacterAction}>
                  <input type="hidden" name="id" value={character.id} />
                  <button className="text-action" type="submit">Cancelar exclusão</button>
                </form>
              </div>
            ) : (
              <details className="delete-character">
                <summary>Agendar exclusão</summary>
                <form action={scheduleCharacterDeletionAction}>
                  <input type="hidden" name="id" value={character.id} />
                  <input type="hidden" name="name" value={character.name} />
                  <label>
                    Digite <strong>{character.name}</strong> para confirmar
                    <input name="confirmation" autoComplete="off" required />
                  </label>
                  <button className="danger-action" type="submit">Excluir em 7 dias</button>
                </form>
              </details>
            )}
          </article>
        ))}

        {characters.length < 4 && (
          <article className="character-card character-create">
            <div>
              <p className="character-class">Novo viajante</p>
              <h3>Prepare uma história</h3>
            </div>
            <form action={createCharacterAction} className="character-form">
              <label>Nome<input name="name" minLength={3} maxLength={24} pattern="[A-Za-zÀ-ÿ0-9]+" required /></label>
              <div className="form-row">
                <label>Classe
                  <select name="archetype" defaultValue="warrior">
                    {Object.entries(classes).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                </label>
                <label>Gênero
                  <select name="gender" defaultValue="male">
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </label>
              </div>
              <button className="button button-secondary" type="submit">Criar personagem</button>
            </form>
          </article>
        )}
      </div>
    </section>
  );
}
