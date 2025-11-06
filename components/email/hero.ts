export type EmailHero = "kaaba" | "hajj" | "umrah";

export function getRandomEmailHero(): EmailHero {
  const heroes: EmailHero[] = ["kaaba", "hajj", "umrah"];
  return heroes[Math.floor(Math.random() * heroes.length)];
}
