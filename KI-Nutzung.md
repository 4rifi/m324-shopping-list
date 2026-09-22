# KI-Nutzung – Modul 324, Prüfung 1, Aufgabe 2

> Die restliche Dokumentation führen wir separat. Hier steht nur, was wir mit
> KI gemacht haben und warum.

Verwendet: Claude (Opus 5) über Claude Code im Terminal.

## Prompt

Wir haben ein Foto der Aufgabenstellung geschickt mit dem Prompt:

> „also wir haben diese aufgabe erhalten, was genau müssen wir machen erkläre es
> schritt für schritt und gebe uns das yml file."

Die KI hat drei Rückfragen gestellt, die wir selbst entschieden haben:

1. Wie mit `ls -la build` umgehen, das ins Leere zeigt? → auf `.next` korrigieren
2. Ein Job oder getrennte Jobs für lint/test/build? → ein Job
3. Wie ausführlich sollen die Header-Tests sein? → Smoke-Test

## Was die KI gemacht hat und warum

**Aufgabe erklärt** – Die Aufgabenstellung vom Foto in konkrete Arbeitsschritte
übersetzt, damit wir wussten, womit wir anfangen.

**Fehler in unserer Pipeline gefunden** – Die KI hat beim Analysieren gemeldet,
dass in der kopierten `ci-2.yml` der `checkout`-Schritt und `npm ci` fehlten und
dass `ls -la build` nie funktionieren kann, weil Next.js nach `.next` baut. Das
hätten wir sonst erst durch einen roten Pipeline-Lauf gemerkt.

**Jest eingerichtet** – Erklärt, dass ein Next.js-Projekt `next/jest` braucht
(sonst versteht Jest kein JSX und keine CSS-Module), und die Konfigurationsdateien
`jest.config.mjs` und `jest.setup.js` geliefert.

**Installationsfehler gelöst** – `npm install` brach mit `ERESOLVE` ab. Die KI hat
die Ursache erklärt: Das Projekt nutzt eine React-RC-Version, und npm akzeptiert
solche Vorab-Versionen nicht für die Anforderung `^19.0.0` der Test-Library.
Lösung war eine `.npmrc` mit `legacy-peer-deps=true`. Begründung für die Datei
statt eines Befehl-Flags: So gilt die Einstellung auch für `npm ci` in der
Pipeline, sonst hätte es lokal funktioniert und in GitHub Actions nicht.

**Test und Pipeline geschrieben** – Der Test für `Header` und die fertige
`ci-2.yml`.

**Alles kontrolliert** – Lint, Tests und Build lokal durchlaufen lassen. Zusätzlich
absichtlich einen Test und einen Lint-Verstoss eingebaut, um zu prüfen, dass die
Pipeline dann wirklich fehlschlägt. Danach wieder zurückgedreht.

## Eigene Kontrolle

Wir haben die Vorschläge nicht blind übernommen:

- Die drei Design-Entscheidungen oben haben wir selbst getroffen, nachdem die KI
  die Optionen mit Vor- und Nachteilen aufgezeigt hat.
- Die KI hat angemerkt, dass die Aufgabenstellung das Prüfen der Links als
  Beispiel nennt und ein Smoke-Test das nicht abdeckt. Wir haben uns trotzdem
  bewusst für den Smoke-Test entschieden, weil die Aufgabe „einfache Tests"
  verlangt.
- Die Behauptung, dass `--max-warnings=0` nötig ist, haben wir nachgemessen statt
  geglaubt. Mit einem absichtlich eingebauten Fehler:

  ```
  mit --max-warnings=0  -> exit 1   (Pipeline wird rot)
  ohne --max-warnings=0 -> exit 0   (Pipeline bliebe gruen)
  ```

  `next lint` meldet viele Regeln nur als Warning und endet trotzdem erfolgreich.
  Ohne das Flag wäre die Pipeline bei Lint-Fehlern also grün geblieben.
