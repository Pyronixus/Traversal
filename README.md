# Traversal — système de langue

## Installation

Remplacez `index.html`, `script.js` et `style.css` dans le projet par les versions fournies, puis ajoutez `translations.js` à la racine. Conservez le dossier `assets/` déjà utilisé par votre jeu.

Le fichier `index.html` charge i18next 26.3.4 depuis cdnjs, puis les ressources de traduction locales dans `translations.js`. Aucun service de traduction distant n'est appelé pour les textes : le changement de langue utilise les ressources incluses dans le projet.

## Piece classes

The movement range is the standard movement budget for orthogonal routes. Strength is used when calculating attacks and the points awarded for a successful exit.

| Piece | Movement range | Strength | Special behavior |
| --- | ---: | ---: | --- |
| **Explorer** | 5 | 1 | Can also move diagonally by one square or move two squares orthogonally if the intervening square is empty. These special moves do not use the standard route calculation. |
| **Vanguard** | 4 | 2 | Receives an additional +1 attack bonus when the attack route costs exactly 4 movement points. |
| **Sentinel** | 3 | 3 | If a Sentinel is the first piece to exit the board, its player wins immediately. |

## Movement and terrain

Normal movement follows orthogonally adjacent squares. Each step costs:

- **1 movement point** when the source and destination squares have the same height.
- **1 + the absolute height difference** when their heights differ.

A move is legal only if its complete route fits within the piece's movement budget. Occupied squares block normal routes. An enemy-occupied destination may be available as an attack if the combat calculation succeeds.

## Combat

When an attack is evaluated, the game calculates attack strength and defense:

- The attacking piece starts with its base strength.
- The attacker gains **+1** when it stands on higher terrain than the target, or **−1** when it stands on lower terrain.
- Friendly pieces adjacent to the target square support the attack by adding their strength to the attack total.
- Each defending-side piece adjacent to the target square adds **+1** to the defense total.
- A Vanguard attacking with a route cost of exactly **4** receives an additional **+1** attack bonus.

The attack succeeds when the resulting attack total is **greater than or equal to** the defense total. A successful attack removes the target piece.

## Exiting and winning

Pieces try to leave the board through the edge opposite their starting side. An exiting piece is removed from the board and awards points equal to its strength.

The game ends when one of the following occurs:

1. **A Sentinel exits first.** That player's victory is immediate.
2. **Two pieces have exited.** The game ends and the higher score wins; equal scores produce a draw.
3. **One side has no pieces left on the board.** The remaining score is adjusted using the highest-strength piece still on each side, if any, and the winner is determined by score.
4. **The 200-move limit is reached.** Scores determine the winner. If scores are tied, the game compares the remaining pieces' progress toward their respective exit edges, then their strengths.

If the active player has no legal move, that turn is skipped.

## Piece skins

Choose any of the seven skins from the **Skin** menu:

| Skin | Appearance |
| --- | --- |
| **Classic Wood** | Warm wood tones and polished accents. |
| **Obsidian** | Dark volcanic-glass surfaces with colored veins. |
| **Imperial Marble** | Light and dark marble with mineral veining and metallic details. |
| **Imperial Jade** | Jade-like surfaces, veins, and gold accents. |
| **Polar Chrome** | Reflective metallic surfaces with cool highlights. |
| **Antique Bronze** | Bronze tones with a patina effect. |
| **Neon** | Dark surfaces, luminous traces, and bright accents. |

The materials and texture details are generated in code; the game does not require external texture images for the pieces themselves.

## Technical overview

- **Rendering:** Three.js r128 is loaded from cdnjs. The scene uses WebGL, shadows, environment reflections, generated canvas textures, antialiasing, and a post-processing shader.
- **Resolution scaling:** the renderer starts at a device-pixel-ratio-aware resolution (up to 2×) and adjusts its internal resolution based on observed frame rate. Results depend on the browser and hardware.
- **Audio:** sound effects are synthesized in the browser. Audio may begin only after a user interaction, depending on browser autoplay policies.
- **Fonts:** the page requests Texturina from Google Fonts and Angel Wish from OnlineWebFonts. If those services are unavailable, the browser uses the configured fallback font families.
- **Game state:** the current game is held in memory. Reloading the page starts a fresh game; save-game persistence is not implemented.
- **Online services:** the game does not require an account or backend, but the HTML references external CDNs for Three.js and fonts.

## Customization

- **Rules and board:** edit the constants and rule functions near the beginning of `script.js`. Board setup, terrain generation, exits, and rendering also depend on the board size, so changing it may require coordinated changes.
- **Skins:** add or edit entries in the `PIECE_SKINS` object in `script.js`. Each skin defines materials for both players and supports body, inset, and accent finishes.
- **Layout:** adjust spacing, typography, and responsive behavior in `style.css`.
- **Interface:** edit visible labels and CDN references in `index.html`.

Reload the page after making changes.

## Troubleshooting

<details>
  <summary><strong>The board is blank or does not render</strong></summary>

  - Confirm that WebGL is supported and enabled in your browser.
  - Update your browser and graphics drivers if needed.
  - Open the browser developer console and check for JavaScript or WebGL errors.
  - Run the page through a local web server instead of opening `index.html` directly.
</details>

<details>
  <summary><strong>The fonts look different</strong></summary>

  The fonts are downloaded from external services. Check your internet connection, or remove/change the font links in `index.html`.
</details>

<details>
  <summary><strong>There is no sound</strong></summary>

  Interact with the page first, confirm that **Sound: On** is displayed, and check the browser tab and system volume.
</details>

<details>
  <summary><strong>Performance is low</strong></summary>

  Close other GPU-intensive tabs or applications. The game can reduce its rendering resolution when frame rates drop, but performance still depends on the browser and graphics hardware.
</details>

## License

This project is under [Mit License](LICENSE).

---

<div align="center">
  <sub>Traversal · 3D strategy, terrain, and tactical movement</sub>
</div>
