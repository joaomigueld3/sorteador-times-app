import { PlayerAttributes } from "./Round";

type Ratings = Record<string, PlayerAttributes>;

/**
 * Média arredondada de cada atributo, por jogador, considerando só os votos que avaliaram aquele jogador.
 * Jogadores sem nenhum voto não aparecem no resultado.
 */
export function computeAverages(ratingsList: Ratings[]): Ratings {
  const totals: Record<string, PlayerAttributes & { count: number }> = {};

  for (const ratings of ratingsList) {
    for (const [playerId, attrs] of Object.entries(ratings)) {
      const total = (totals[playerId] ??= { fisico: 0, habilidade: 0, defesa: 0, count: 0 });
      total.fisico += attrs.fisico;
      total.habilidade += attrs.habilidade;
      total.defesa += attrs.defesa;
      total.count += 1;
    }
  }

  const averages: Ratings = {};
  for (const [playerId, total] of Object.entries(totals)) {
    averages[playerId] = {
      fisico: Math.round(total.fisico / total.count),
      habilidade: Math.round(total.habilidade / total.count),
      defesa: Math.round(total.defesa / total.count),
    };
  }
  return averages;
}
