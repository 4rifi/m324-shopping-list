
---

# Aufgabe 3 – Multiple Jobs

Rolle der KI hier: **Ideen entwickeln**.

## Prompt

Wir haben ein Foto der Aufgabenstellung geschickt und die KI gebeten, uns
sinnvolle Beispiele für den Umbau der Pipeline in mehrere Jobs vorzuschlagen.
Die Auswahl haben wir danach selbst getroffen.

## Die drei erhaltenen Vorschläge

**Variante A – Sequenzielle Kette**

`lint → test → build → deploy`, jeder Job wartet per `needs:` auf den vorherigen.
Am einfachsten zu lesen, dauert aber rund 3 Minuten. Nachteil: Ein Lint-Fehler
verhindert, dass man die Testergebnisse überhaupt zu sehen bekommt.

**Variante B – Lint und Test parallel**

```
lint ────┐
         ├──→ build ──→ deploy
test ────┘
```

`lint` und `test` laufen gleichzeitig, `build` hat `needs: [lint, test]`,
`deploy` hat `needs: build`. Rund 1.5 Minuten.

**Variante C – Wie B, plus Artefakt-Übergabe**

Zusätzlich lädt `build` den Ordner `.next` mit `actions/upload-artifact@v4` hoch,
und `deploy` holt ihn sich mit `download-artifact` wieder. Damit arbeitet der
Deployment-Job mit dem echten Build-Ergebnis statt nur mit einem `echo`.

## Unsere Auswahl: Variante B

Begründung:

- Lint- und Testfehler sind voneinander unabhängig. Wenn beide Prüfungen
  gleichzeitig laufen, sehen wir in einem einzigen Durchlauf, ob es im Code-Stil
  *und* in den Tests Probleme gibt. Bei Variante A müssten wir erst den
  Lint-Fehler beheben und neu pushen, um überhaupt zu erfahren, ob die Tests
  durchlaufen.
- `build` startet erst, wenn beide Prüfungen grün sind. So wird keine Zeit in
  einen Build gesteckt, der ohnehin verworfen würde.
- Variante C haben wir verworfen: Die Aufgabe verlangt ausdrücklich nur ein
  *simuliertes* Deployment mit einem `echo`. Der Artefakt-Transfer wäre
  technisch interessant, bringt hier aber nur zusätzliche Komplexität ohne
  Mehrwert für die Aufgabenstellung.

## Was wir dabei verstanden haben

Jeder Job läuft auf einem **eigenen, frischen Runner**. Es gibt kein gemeinsames
Dateisystem zwischen den Jobs. Deshalb muss jeder Job, der mit dem Code
arbeitet, erneut `checkout`, `setup-node` und `npm ci` ausführen – `build` erbt
nichts vom `lint`-Job.

Der `deploy`-Job hat bewusst **keinen** Checkout und kein `npm ci`, weil er nur
ein `echo` ausführt und den Code gar nicht braucht.

Preis der Aufteilung: `npm ci` läuft jetzt dreimal statt einmal. Der npm-Cache
aus `setup-node` (`cache: npm`) federt das ab.
