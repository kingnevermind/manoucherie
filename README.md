# Inventaire bières

Mini-application statique pour Android : compte les **bières restantes**, calcule automatiquement le coût des bières consommées.

## Publication GitHub Pages

1. Créer un dépôt GitHub, par exemple `inventaire-bieres` (public pour GitHub Pages sur GitHub Free).
2. Envoyer **tous les fichiers de ce dossier à la racine du dépôt**, notamment `index.html`.
3. Dans **Settings → Pages**, sélectionner **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis enregistrer.
4. Ouvrir l'URL affichée par GitHub Pages (souvent `https://PSEUDO.github.io/inventaire-bieres/`) sur Android.
5. Dans Chrome, utiliser le menu **Ajouter à l'écran d'accueil** ou **Installer l'application** si proposé.
6. Ouvrir une première fois avec Internet. L'application pourra ensuite fonctionner hors ligne une fois ses ressources mises en cache.

## Utilisation

- Le nombre affiché entre `−` et `+` est la **quantité restante**.
- Cliquer `−` lorsqu'une bière a été consommée (ou saisir les restes à la fin).
- Les montants sont calculés à partir du ticket, **hors consignes**.
- La saisie est sauvegardée automatiquement dans le stockage local du navigateur.
- Cliquer **Sauvegarder (JSON)**, puis transférer le fichier téléchargé dans **Proton Drive** pour le backup cloud.
- Cliquer **Restaurer une sauvegarde** pour réimporter le JSON.

**Important :** GitHub Pages héberge le code, pas les quantités saisies. Proton Drive ne reçoit rien automatiquement. Le stockage du navigateur peut être effacé ; sauvegarder un JSON après la saisie. L'inventaire ne se synchronise pas entre appareils.

Le total des produits sur le ticket est de **134,87 €**, pour **34 unités**.
