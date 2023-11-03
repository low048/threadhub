# ThreadHub
"ThreadHub" - informacinių sistemų inžinerijos pirmakursių komandinis projektas, siekiantis atkurti "Reddit" platformą.

# Norint pradėti dirbti:

Instaliuokite [GitHub Desktop](https://desktop.github.com/).

1. github.com prisijungę prie paskyros, atsidarykite [projekto repo puslapį](https://github.com/low048/threadhub).
2. Paspauskite `Code` mygtuką ir pasirinkite `Open with GitHub Desktop`.
3. Pasirinkite, kur norite išsaugoti projekto kopiją.
4. Paspauskite `Clone`.

Kodo redagavimui rekomenduoju naudoti [VS Code](https://code.visualstudio.com/). Visi aktualūs failai randami \src.

# Norint paleisti programą:

Privaloma turėti įdiegtą [Node.js](https://nodejs.org/) su npm.

Atsidarykite Command Prompt (cmd).

```
cd C:\PATH-TO-PROJECT-ROOT-DIRECTORY
```

```
npm install 
```

```
npm run serve
```


Po šių komandų įvykdymo, projektas turėtų pasileisti ant http://localhost:8080/. Atlikus pakeitimus, programa atsinaujins automatiškai.

# Darbas su Git naudojant GitHub Desktop

Kiekvienam funkcionalumui turi būti sukurtas atskiras branch.

### Sukurkite naują branch:

1. GitHub Desktop, pasirinkite `Current branch` meniu viršuje.
2. Spauskite `New Branch`.
3. Įveskite branch pavadinimą, susijusį su funkcionalumu, kurį ketinate kurti.
4. Paspauskite `Create Branch` ir pereikite į šią naują atšaką.

### Atlikite pakeitimus ir įrašykite juos:

- Redaguokite kodą
- GitHub Desktop automatiškai nustatys pakeistus failus.
- Apačioje įrašykite prasmingą commit message, apibūdinantį atliktus pakeitimus.
- Spauskite `Commit to [branch-name]`.

### Įkelkite pakeitimus į repo:

- Kai esate pasiruošę dalintis savo pakeitimais, spauskite `Publish branch` (jei ši atšaka dar nebuvo įkelta), arba `Push origin`, kad įkeltumėte naujausius commits į GitHub.
