# SinaLib Quiz de LIBRAS (FAESA · ESX)

SPA de quiz para estande de evento: assista a um vídeo de sinal em LIBRAS e
escolha a palavra correta. HTML/CSS/JS puro, sem etapa de build. Mesma
identidade visual do jogo de nomes SinaLib (`../esx`).

## Fluxo

home (chamada) → vídeo de introdução (pulável) → tela de prontidão → quiz
(5 perguntas, ordem aleatória, alternativas em 2×2) → pontuação → reset
automático para a home após 10 s. Uma sessão abandonada volta para a home
após 90 s de inatividade.

## Como rodar

```bash
python -m http.server 8000   # a partir desta pasta
# abra http://localhost:8000
```

Sirva via HTTP (não `file://`) para que os vídeos sejam transmitidos de forma
confiável. No estande, abra o navegador em modo quiosque/tela cheia (F11).

## Adicionando uma palavra

1. Coloque `videos/<nome>.mp4` (minúsculas, sem acentos no nome do arquivo).
2. Acrescente `<nome>` a `WORDS` no `app.js`.
3. Se o nome exibido precisar de acentos/maiúsculas, adicione-o a `LABELS`
   (ex.: `parabens: "Parabéns"`).
