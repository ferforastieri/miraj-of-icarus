"use client";

import Image from "next/image";
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
import { gameClasses } from "@/data/game-classes";

const classes = Object.fromEntries(gameClasses.map(gameClass => [gameClass.id, gameClass.name]));
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
        <span className="grid min-h-[54px] min-w-[180px] place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-5 font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.06em] text-[#e4ecdf] [text-shadow:0_2px_2px_#041b16]">{values.length} / 4 slots</span>
      </div>
      {message && <Alert className="mb-5" kind={message.kind} role="status">{message.text}</Alert>}
      <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        {values.map(character => (
          <article className={`jade-card relative grid min-h-[280px] grid-cols-[76px_1fr] content-start gap-5 px-3 py-3 drop-shadow-[0_18px_28px_rgba(3,27,22,.3)] max-[620px]:grid-cols-[62px_1fr] max-[620px]:px-0 max-[620px]:py-2 ${character.deletionScheduledAt ? "opacity-75" : ""}`} key={character.id}>
            <Image className="h-[71px] w-[71px] object-contain max-[620px]:size-[62px]" src={`/media/game-ui/classes/bronze/${character.archetype}.png`} alt="" width={256} height={256} />
            <div><p className="mb-1 text-xs uppercase tracking-[.14em] text-ancient-gold">{classes[character.archetype] ?? character.archetype} · Nível {character.level}</p><h3 className="mb-1 font-display text-3xl font-medium">{character.name}</h3><p className="text-xs text-mist">Criado em {formatDate(character.createdAt)}</p></div>
            {character.deletionScheduledAt ? (
              <div className="col-span-full mt-4 flex items-center justify-between gap-5 border-t border-moonsteel/20 pt-4 max-[620px]:flex-col max-[620px]:items-start">
                <p className="text-sm text-[#d49ba0]">Bloqueado. Exclusão em {formatDate(character.deletionScheduledAt)}.</p>
                <button className="cursor-pointer border-0 bg-transparent text-xs uppercase tracking-[.08em] text-jade" type="button" onClick={() => restoreCharacter(character.id)} disabled={restore.isPending}>Cancelar exclusão</button>
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
          <article className="jade-card relative min-h-[280px] px-3 py-3 drop-shadow-[0_18px_28px_rgba(3,27,22,.3)] max-[620px]:px-0 max-[620px]:py-2">
            <p className="mb-1 text-xs uppercase tracking-[.14em] text-ancient-gold">Novo viajante</p><h3 className="font-display text-3xl font-medium">Prepare uma história</h3>
            <form className="mt-5 grid gap-3.5" onSubmit={createCharacter}>
              <label className={labelClass}>Nome<Input name="name" minLength={3} maxLength={24} pattern="[A-Za-zÀ-ÿ0-9]+" required /></label>
              <fieldset className="border-0 p-0">
                <legend className="mb-3 text-xs uppercase tracking-[.1em] text-mist">Classe</legend>
                <div className="grid grid-cols-4 items-start gap-1 max-[620px]:grid-cols-2">
                  {Object.entries(classes).map(([value, label], index) => (
                    <label className="group grid min-h-[136px] cursor-pointer grid-rows-[113px_auto] justify-items-center text-center" key={value}>
                      <input className="peer sr-only" type="radio" name="archetype" value={value} defaultChecked={index === 0} />
                      <Image className="mt-3 size-[71px] object-contain peer-checked:hidden" src={`/media/game-ui/classes/bronze/${value}.png`} alt="" width={256} height={256} />
                      <Image className="hidden h-auto w-[89px] object-contain peer-checked:block" src={`/media/game-ui/classes/bronze/${value}-selected.png`} alt="" width={256} height={256} />
                      <span className="font-miraj-of-icarus text-[.68rem] font-semibold uppercase tracking-[.03em] text-mist peer-checked:text-jade peer-checked:[text-shadow:0_0_7px_rgba(40,185,111,.75)]">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="border-0 p-0">
                <legend className="mb-2 text-xs uppercase tracking-[.1em] text-mist">Gênero</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[["male", "Masculino", "♂"], ["female", "Feminino", "♀"]].map(([value, label, symbol], index) => (
                    <label className="cursor-pointer" key={value}>
                      <input className="peer sr-only" type="radio" name="gender" value={value} defaultChecked={index === 0} />
                      <span className="flex min-h-[54px] items-center justify-center gap-2 bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.04em] text-mist [text-shadow:0_2px_2px_#041b16] peer-checked:bg-[url('/media/game-ui/jade/button-focused.png')] peer-checked:text-white peer-checked:drop-shadow-[0_0_7px_rgba(40,185,111,.55)]"><b className="text-lg font-normal">{symbol}</b>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button className="justify-self-start" type="submit" disabled={create.isPending}>{create.isPending ? "Criando..." : "Criar personagem"}</Button>
            </form>
          </article>
        )}
      </div>
    </section>
  );
}
