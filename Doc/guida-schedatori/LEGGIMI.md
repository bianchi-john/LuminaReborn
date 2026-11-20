# Guida per chi scheda

Materiale da consegnare al personale dei musei che usa LUMiNA (schedatori e amministratore).

| File | Cosa contiene |
|------|---------------|
| `LUMINA-guida-rapida.pdf` | La guida illustrata, pronta da inviare (13 pagine A4) |
| `guida.html` + `img/` | Il sorgente della guida: testo e schermate annotate |
| `crea-account-docx.js` | Genera il documento Word con gli account (`LUMINA-account.docx`) |

Le password **non stanno mai nel repository**: il documento Word si genera nella cartella `consegna/`, esclusa da git (vedi `.gitignore`).

## Rigenerare il PDF dopo una modifica

```bash
cd Doc/guida-schedatori
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf="$PWD/LUMINA-guida-rapida.pdf" "file://$PWD/guida.html"
```

Le schermate in `img/` sono state fatte sul sito locale con account e scheda di esempio; i riquadri rossi sono aggiunti dopo. L'indirizzo del sito è scritto in `guida.html`: va cambiato se il sito si sposta.

## Rigenerare il documento con gli account

Serve il file di testo degli account creato sul server (`~/LUMINA-ACCOUNT.txt`, righe `utente: …  password: …`), copiato in `consegna/.account-sorgente.txt`.

```bash
cd "$(mktemp -d)" && npm install docx@9 --no-audit --no-fund
node /percorso/del/repo/Doc/guida-schedatori/crea-account-docx.js \
  /percorso/del/repo/consegna/.account-sorgente.txt \
  /percorso/del/repo/consegna/LUMINA-account.docx
```

Con `MASCHERA=1` davanti al comando le password vengono sostituite da `X`: serve per controllare l'impaginazione senza mostrarle.
