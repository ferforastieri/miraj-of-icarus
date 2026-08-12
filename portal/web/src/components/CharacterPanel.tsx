"use client";

import { useState, type FormEvent } from "react";
import { useCreateCharacter } from "@/api/characters/create-character";
import { useDeleteCharacter } from "@/api/characters/delete-character";
import { useCharacters, type Character } from "@/api/characters/get-characters";
import { useRestoreCharacter } from "@/api/characters/restore-character";
import { ApiError } from "@/api/http";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Kicker } from "@/components/ui/Kicker";
import { Select } from "@/components/ui/Select";

const classes: Record<string, string> = { warrior: "Guerreiro", priest: "Sacerdote", wizard: "Mago", nature: "Naturalista", thief: "Ladino", guardian: "Guardião" };
const messages: Record<string, string> = {
  invalid_character_name: "Use de 3 a 24 letras ou números no nome.",
  invalid_archetype: "Escolha uma classe válida.",
  invalid_gender: "Escolha um gênero válido.",
  character_slots_full: "Os quatro slots da conta estão ocupados.",
  character_name_unavailable: "Esse nome de personagem já está em uso.",
  character_confirmation_invalid: "Digite exatamente o nome do personagem para confirmar.",
  session_expired: "Sua sessão terminou. Entre novamente.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

export function CharacterPanel({ enabled }: { enabled: boolean }) {
  const characters = useCharacters(enabled);
  const create = useCreateCharacter();
  const remove = useDeleteCharacter();
  const restore = useRestoreCharacter();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string }>();
  const values = characters.data ?? [];

  function failure(reason: unknown) {
    const code = reason instanceof ApiError ? reason.code : "service_unavailable";
    setMessage({ kind: "error", text: messages[code] ?? "Não foi possível concluir a ação." });
  }

  async function createCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const data = new FormData(target);
    try {
      await create.mutateAsync({ name: String(data.get("name") ?? "").trim(), archetype: String(data.get("archetype")), gender: String(data.get("gender")) });
      target.reset();
      setMessage({ kind: "success", text: "Personagem criado." });
    } catch (reason) { failure(reason); }
  }

  async function schedule(event: FormEvent<HTMLFormElement>, character: Character) {
    event.preventDefault();
    const confirmation = String(new FormData(event.currentTarget).get("confirmation") ?? "");
    if (confirmation !== character.name) return failure(new ApiError("character_confirmation_invalid", 400));
    try {
      await remove.mutateAsync(character.id);
      setMessage({ kind: "success", text: "Exclusão agendada. Você pode cancelar durante sete dias." });
    } catch (reason) { failure(reason); }
  }

  async function restoreCharacter(id: string) {
    try {
      await restore.mutateAsync(id);
      setMessage({ kind: "success", text: "Exclusão cancelada. O personagem já pode entrar no jogo." });
    } catch (reason) { failure(reason); }
  }

  const labelClass = "grid gap-2 text-xs uppercase tracking-[.1em] text-mist";
  return (
    <section className="mb-28" id="personagens" aria-labelledby="characters-title">
      <div className="mb-11 flex items-end justify-between gap-8 max-[620px]:flex-col max-[620px]:items-start">
        <div><Kicker>Até quatro viajantes</Kicker><h2 id="characters-title" className="font-display text-[clamp(2.65rem,5vw,5rem)] font-medium leading-[.95] tracking-[-.025em]">Seus personagens</h2></div>
        <span className="border border-moonsteel/20 px-3 py-2 text-xs uppercase tracking-[.14em] text-ancient-gold">{values.length} / 4 slots</span>
      </div>
      {message && <Alert className="mb-5" kind={message.kind} role="status">{message.text}</Alert>}
      <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        {values.map(character => (
          <article className={`relative grid min-h-[250px] grid-cols-[66px_1fr] content-start gap-5 border bg-gradient-to-br from-iron/90 to-[rgba(9,14,18,.96)] p-7 after:absolute after:top-0 after:right-0 after:h-px after:w-10 after:bg-ancient-gold max-[620px]:grid-cols-[54px_1fr] max-[620px]:p-5 ${character.deletionScheduledAt ? "border-danger/40" : "border-moonsteel/20"}`} key={character.id}>
            <div className="grid size-[62px] rotate-45 place-items-center border border-frost/40 font-display text-3xl text-frost max-[620px]:size-[50px]" aria-hidden="true"><span className="-rotate-45">{character.name.slice(0, 1)}</span></div>
            <div><p className="mb-1 text-xs uppercase tracking-[.14em] text-ancient-gold">{classes[character.archetype] ?? character.archetype} · Nível {character.level}</p><h3 className="mb-1 font-display text-3xl font-medium">{character.name}</h3><p className="text-xs text-mist">Criado em {formatDate(character.createdAt)}</p></div>
            {character.deletionScheduledAt ? (
              <div className="col-span-full mt-4 flex items-center justify-between gap-5 border-t border-moonsteel/20 pt-4 max-[620px]:flex-col max-[620px]:items-start">
                <p className="text-sm text-[#d49ba0]">Bloqueado. Exclusão em {formatDate(character.deletionScheduledAt)}.</p>
                <button className="cursor-pointer border-0 bg-transparent text-xs uppercase tracking-[.08em] text-frost" type="button" onClick={() => restoreCharacter(character.id)} disabled={restore.isPending}>Cancelar exclusão</button>
              </div>
            ) : (
              <details className="col-span-full mt-4 border-t border-moonsteel/20 pt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-[.08em] text-[#c28a8f]">Agendar exclusão</summary>
                <form className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3 max-[620px]:grid-cols-1" onSubmit={event => schedule(event, character)}>
                  <label className="grid gap-2 text-xs text-mist">Digite <strong>{character.name}</strong> para confirmar<Input name="confirmation" autoComplete="off" required /></label>
                  <Button variant="danger" type="submit" disabled={remove.isPending}>Excluir em 7 dias</Button>
                </form>
              </details>
            )}
          </article>
        ))}
        {values.length < 4 && (
          <article className="relative min-h-[250px] border border-moonsteel/20 bg-gradient-to-br from-iron/90 to-[rgba(9,14,18,.96)] p-7 after:absolute after:top-0 after:right-0 after:h-px after:w-10 after:bg-ancient-gold max-[620px]:p-5">
            <p className="mb-1 text-xs uppercase tracking-[.14em] text-ancient-gold">Novo viajante</p><h3 className="font-display text-3xl font-medium">Prepare uma história</h3>
            <form className="mt-5 grid gap-3.5" onSubmit={createCharacter}>
              <label className={labelClass}>Nome<Input name="name" minLength={3} maxLength={24} pattern="[A-Za-zÀ-ÿ0-9]+" required /></label>
              <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                <label className={labelClass}>Classe<Select name="archetype" defaultValue="warrior">{Object.entries(classes).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select></label>
                <label className={labelClass}>Gênero<Select name="gender" defaultValue="male"><option value="male">Masculino</option><option value="female">Feminino</option></Select></label>
              </div>
              <Button className="justify-self-start" type="submit" disabled={create.isPending}>{create.isPending ? "Criando..." : "Criar personagem"}</Button>
            </form>
          </article>
        )}
      </div>
    </section>
  );
}
