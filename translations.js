/* Traversal i18n resources. Text is bundled locally so changing language never calls a translation API. */
(() => {
  "use strict";

  const LOCALES = {
    fr: {
      rules: {
        header: {
          language: "Langue",
          kicker: "ON APPREND À JOUER",
          title: "On découvre Traversal ?",
          subtitle:
            "On avance étape par étape. Tu peux tourner chaque exemple 3D pour mieux comprendre.",
          close: "Fermer le tutoriel",
          progress: "Progression du tutoriel",
          track:
            "Étapes du tutoriel. Utilise les flèches ou la molette pour naviguer.",
          guide: "LE GUIDE",
          previous: "Étape précédente",
          next: "Étape suivante",
          skipStartup: "Ne plus afficher au démarrage",
          skinTitle: "Choisir un skin de pièce",
          closeSkin: "Fermer la sélection des skins",
          openRules: "Ouvrir les règles du jeu",
          openSkins: "Ouvrir les skins",
          newBoard: "Créer un nouveau plateau",
          modeBot: "Jouer contre le bot",
          modePlayers: "Passer en mode deux joueurs",
          soundOn: "Désactiver le son",
          soundOff: "Activer le son",
        },
        slides: [
          {
            label: "01 · LE BUT",
            title: "Le but : atteindre l’autre bord",
            paragraphs: [
              "Tu joues sur un plateau de <strong>10 × 10 cases</strong>. Certaines cases sont plus hautes que d’autres : le relief compte vraiment dans Traversal.",
              "Chaque camp commence avec <strong>six pièces</strong>. Elles partent de deux bords opposés et doivent rejoindre le bord adverse. En solo, tu joues les pièces claires contre le bot ; à deux, chacun contrôle un camp.",
            ],
            tip: "<strong>Pour commencer :</strong> regarde d’abord les déplacements. Une bonne route peut te faire gagner des points et éviter un combat risqué.",
            caption: "Plateau 10 × 10 · deux camps · six pièces chacun",
            hint: "Clique et fais glisser pour tourner",
          },
          {
            label: "02 · TES PIÈCES",
            title: "Trois pièces, trois façons de jouer",
            paragraphs: [
              "Le chiffre « déplacement » indique ton budget pour un trajet normal. La « force » sert aux combats et détermine les points gagnés quand la pièce sort.",
            ],
            stats: [
              {
                line1: "Déplacement 5 · Force 1",
                line2: "Il va loin et possède deux déplacements spéciaux.",
              },
              {
                line1: "Déplacement 4 · Force 2",
                line2:
                  "Il reçoit +1 en attaque quand le trajet de l’attaque coûte exactement 4 points.",
              },
              {
                line1: "Déplacement 3 · Force 3",
                line2:
                  "Il est le plus fort. Si c’est la première pièce à sortir, la partie est gagnée.",
              },
            ],
            tip: "<strong>Le compromis à retenir :</strong> plus une pièce est forte, moins elle va loin pendant un déplacement normal.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Tourne les pièces pour les regarder",
          },
          {
            label: "03 · SE DÉPLACER",
            title: "Le relief change le coût",
            paragraphs: [
              "Un déplacement normal se fait de case voisine en case voisine, <strong>horizontalement ou verticalement</strong>. Tu peux enchaîner plusieurs étapes tant que tu as assez de points.",
              "Sur une hauteur identique, une étape coûte <strong>1 point</strong>. Avec un niveau d’écart, elle coûte <strong>2 points</strong> ; avec deux niveaux d’écart, <strong>3 points</strong>. On additionne le coût de chaque étape.",
              "Une pièce bloque le passage : tu ne peux pas traverser une case occupée pendant un trajet normal. Une pièce ennemie peut être attaquée si le jeu indique cette case comme destination possible.",
            ],
            tip: "<strong>Petit exemple :</strong> si tu montes de deux niveaux d’un coup, tu dépenses 3 points pour cette seule étape.",
            caption:
              "Les marches et les pentes peuvent consommer plus de déplacement",
            hint: "Tourne la scène pour comparer les hauteurs",
          },
          {
            label: "04 · LE CAS DE L’EXPLORER",
            title: "Il a deux raccourcis",
            paragraphs: [
              "L’Explorer peut faire un déplacement spécial d’<strong>une case en diagonale</strong>. Il peut aussi bondir de <strong>deux cases tout droit</strong>, à l’horizontale ou à la verticale.",
              "Pour le bond, la case entre le départ et l’arrivée doit être <strong>vide</strong>. Si une pièce s’y trouve, le bond est bloqué. Ces déplacements spéciaux ne suivent pas le calcul habituel du coût lié au relief.",
            ],
            tip: "<strong>Attention :</strong> l’Explorer est rapide, mais sa force vaut seulement 1. Évite de l’envoyer seul contre une pièce plus puissante.",
            caption:
              "Jaune : diagonale · Cyan : bond valide · Rouge : bond bloqué",
            hint: "Clique et fais glisser pour tourner",
          },
          {
            label: "05 · LES COMBATS",
            title: "Avant d’attaquer, regarde autour",
            paragraphs: [
              "Quand une case ennemie est proposée comme destination, le jeu compare l’attaque et la défense. Le relief et les pièces voisines peuvent faire toute la différence.",
              "Si l’attaque atteint ou dépasse la défense, elle réussit et la pièce visée est retirée du plateau.",
            ],
            bullets: [
              "Si l’attaquant est plus haut que sa cible, il gagne <strong>+1</strong> ; s’il est plus bas, il perd <strong>−1</strong>.",
              "Chaque allié placé juste à côté de la cible ajoute sa <strong>force</strong> à l’attaque.",
              "Chaque défenseur allié placé juste à côté de la cible ajoute <strong>+1</strong> à la défense.",
              "Le Vanguard gagne encore <strong>+1 en attaque</strong> si le coût total du trajet d’attaque vaut exactement 4.",
            ],
            tip: "<strong>Exemple :</strong> un Sentinel (3) en hauteur (+1), aidé par un Explorer allié (+1), attaque à 5. Si le défenseur totalise 4, il est battu.",
            caption:
              "Le terrain et les soutiens autour de la cible changent le résultat",
            hint: "Tourne la scène pour voir les positions",
          },
          {
            label: "06 · SORTIR ET MARQUER",
            title: "La force de la pièce devient des points",
            paragraphs: [
              "Le but est de faire sortir tes pièces par le bord opposé. Quand une pièce sort, elle quitte la partie et son camp marque un nombre de points égal à sa force.",
              "Une pièce sortie ne peut plus bouger ni combattre. Mais attention : sortir avec un Sentinel peut faire gagner immédiatement, selon le moment où il quitte le plateau.",
            ],
            scores: ["1 point", "2 points", "3 points"],
            tip: "<strong>À toi de choisir :</strong> un Explorer marque moins de points, mais il est plus rapide. Un Sentinel est précieux et plus difficile à faire sortir.",
            caption:
              "Une pièce qui passe le bord est retirée et son score est ajouté",
            hint: "Tourne la scène pour voir la sortie",
          },
          {
            label: "07 · FIN DE PARTIE",
            title: "Comment savoir qui a gagné ?",
            paragraphs: [
              "La partie s’arrête dès qu’une des situations suivantes se produit :",
            ],
            bullets: [
              "<strong>Le premier à sortir est un Sentinel :</strong> son camp gagne immédiatement.",
              "<strong>Deux pièces sont sorties au total :</strong> le camp qui a le plus de points gagne. Si les scores sont égaux, c’est un match nul.",
              "<strong>Un camp n’a plus aucune pièce sur le plateau :</strong> chaque camp ajoute la force de sa pièce restante la plus forte à son score, puis les scores sont comparés.",
              "<strong>La partie atteint 200 coups :</strong> les scores sont comparés. En cas d’égalité, le jeu regarde l’avancée des pièces vers la sortie, puis leur force.",
            ],
            tip: "<strong>Le détail important :</strong> la victoire instantanée du Sentinel ne marche que s’il est vraiment la toute première pièce à sortir.",
            caption: "Sentinel premier à sortir : victoire immédiate",
            hint: "Clique et fais glisser pour tourner",
          },
          {
            label: "08 · À TON TOUR",
            title: "Comment jouer, concrètement",
            paragraphs: [
              "Si tu n’as aucun coup légal, le jeu passe ton tour automatiquement.",
              "Le bouton avec les joueurs permet de passer du bot au mode deux joueurs. Le bouton de nouveau plateau génère une nouvelle carte avec un relief différent.",
            ],
            bullets: [
              "<strong>Clique sur une de tes pièces.</strong> Les destinations possibles s’affichent.",
              "<strong>Clique sur une destination en surbrillance.</strong> Le déplacement, le combat ou la sortie se fait tout de suite.",
              "<strong>Observe la hauteur et les pièces voisines.</strong> Un trajet plus coûteux peut être utile, mais vérifie toujours le résultat d’un combat.",
              "<strong>Tourne la caméra</strong> en faisant glisser la souris ou ton doigt sur le plateau.",
            ],
            tip: "<strong>Conseil pour ta première partie :</strong> essaie de déplacer un Explorer, regarde le coût affiché par les cases, puis avance progressivement tes autres pièces.",
            caption: "Sélectionne une pièce, puis une destination surlignée",
            hint: "Clique et fais glisser pour tourner",
          },
        ],
      },
      game: {
        light: "Claires",
        dark: "Sombres",
        move: "coup",
        movement: "déplacement",
        strength: "force",
        pieceInfo: "{{piece}} · déplacement {{movement}} · force {{strength}}",
        playerTurn: "Joueur {{player}} ({{side}}) : à vous de jouer",
        yourTurn: "À toi de jouer",
        botThinking: "Le bot réfléchit…",
        draw: "Match nul",
        playerWins: "Le joueur {{player}} gagne",
        victory: "Victoire !",
        defeat: "Défaite",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported:
          "Les visuels 3D nécessitent un navigateur compatible WebGL.",
        selectSkin: "Choisir le skin Sentinel : {{name}}",
      },
    },
    en: {
      rules: {
        header: {
          language: "Language",
          kicker: "LEARN TO PLAY",
          title: "Discover Traversal",
          subtitle:
            "Learn step by step. Rotate each 3D example to understand the rules more clearly.",
          close: "Close tutorial",
          progress: "Tutorial progress",
          track:
            "Tutorial steps. Use the arrow keys or mouse wheel to navigate.",
          guide: "THE GUIDE",
          previous: "Previous step",
          next: "Next step",
          skipStartup: "Do not show at startup",
          skinTitle: "Choose a piece skin",
          closeSkin: "Close skin selection",
          openRules: "Open game rules",
          openSkins: "Open skins",
          newBoard: "Create a new board",
          modeBot: "Play against the bot",
          modePlayers: "Switch to two-player mode",
          soundOn: "Mute sound",
          soundOff: "Enable sound",
        },
        slides: [
          {
            label: "01 · THE GOAL",
            title: "Reach the opposite edge",
            paragraphs: [
              "You play on a <strong>10 × 10 board</strong>. Some squares are higher than others, so terrain plays a real role in Traversal.",
              "Each side starts with <strong>six pieces</strong>. They begin on opposite edges and must reach the opponent’s edge. In solo mode, you control the light pieces against the bot; in two-player mode, each player controls a side.",
            ],
            tip: "<strong>To get started:</strong> learn the movement rules first. A good route can earn points and help you avoid risky fights.",
            caption: "10 × 10 board · two sides · six pieces each",
            hint: "Click and drag to rotate",
          },
          {
            label: "02 · YOUR PIECES",
            title: "Three pieces, three play styles",
            paragraphs: [
              "Movement is the budget for a normal route. Strength is used in combat and determines how many points a piece scores when it exits.",
            ],
            stats: [
              {
                line1: "Movement 5 · Strength 1",
                line2: "Moves far and has two special moves.",
              },
              {
                line1: "Movement 4 · Strength 2",
                line2:
                  "Gets +1 attack when the attack route costs exactly 4 points.",
              },
              {
                line1: "Movement 3 · Strength 3",
                line2:
                  "The strongest piece. If it is the first to exit, its side wins.",
              },
            ],
            tip: "<strong>The trade-off:</strong> the stronger a piece is, the less distance it can cover in a normal move.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Rotate the pieces to look around them",
          },
          {
            label: "03 · MOVEMENT",
            title: "Terrain changes the cost",
            paragraphs: [
              "Normal movement goes from one adjacent square to another, <strong>horizontally or vertically</strong>. You can chain steps while you have enough movement points.",
              "A step on the same height costs <strong>1 point</strong>. A one-level difference costs <strong>2 points</strong>; a two-level difference costs <strong>3 points</strong>. Add up the cost of every step.",
              "A piece blocks the way: you cannot pass through an occupied square during a normal route. An enemy can be attacked if the game shows its square as a possible destination.",
            ],
            tip: "<strong>Example:</strong> climbing two height levels in one step costs 3 points for that step alone.",
            caption: "Steps and slopes can use more movement points",
            hint: "Rotate the scene to compare heights",
          },
          {
            label: "04 · THE EXPLORER",
            title: "It has two shortcuts",
            paragraphs: [
              "The Explorer can make a special move <strong>one square diagonally</strong>. It can also jump <strong>two squares in a straight line</strong>, horizontally or vertically.",
              "For a jump, the square between the start and destination must be <strong>empty</strong>. If a piece occupies it, the jump is blocked. These special moves ignore the usual terrain-based movement cost.",
            ],
            tip: "<strong>Watch out:</strong> the Explorer is fast, but has only 1 strength. Avoid sending it alone against a stronger piece.",
            caption: "Yellow: diagonal · Cyan: valid jump · Red: blocked jump",
            hint: "Click and drag to rotate",
          },
          {
            label: "05 · COMBAT",
            title: "Look around before attacking",
            paragraphs: [
              "When an enemy square is offered as a destination, the game compares attack and defense. Terrain and nearby pieces can make all the difference.",
              "If attack equals or exceeds defense, the attack succeeds and the target is removed from the board.",
            ],
            bullets: [
              "If the attacker is higher than the target, it gets <strong>+1</strong>; if lower, it gets <strong>−1</strong>.",
              "Each allied piece right next to the target adds its <strong>strength</strong> to the attack.",
              "Each defending ally right next to the target adds <strong>+1</strong> to defense.",
              "The Vanguard gets another <strong>+1 attack</strong> if the full attack route costs exactly 4 points.",
            ],
            tip: "<strong>Example:</strong> an elevated Sentinel (3, +1), supported by an allied Explorer (+1), attacks with 5. A defender with 4 is defeated.",
            caption: "Terrain and nearby support change the result",
            hint: "Rotate the scene to inspect each position",
          },
          {
            label: "06 · EXIT AND SCORE",
            title: "A piece’s strength becomes points",
            paragraphs: [
              "Move your pieces off the opposite edge. When a piece exits, it leaves the game and its side scores points equal to its strength.",
              "An exited piece cannot move or fight again. Be careful: a Sentinel can win the game immediately, depending on when it exits.",
            ],
            scores: ["1 point", "2 points", "3 points"],
            tip: "<strong>Choose your plan:</strong> an Explorer scores less but is faster. A Sentinel is valuable and harder to get off the board.",
            caption:
              "A piece crossing the edge is removed and its score is added",
            hint: "Rotate the scene to see the exit",
          },
          {
            label: "07 · END OF THE GAME",
            title: "How do you win?",
            paragraphs: [
              "The game ends as soon as one of these situations occurs:",
            ],
            bullets: [
              "<strong>The first piece to exit is a Sentinel:</strong> its side wins immediately.",
              "<strong>Two pieces have exited in total:</strong> the side with the higher score wins. A tied score is a draw.",
              "<strong>A side has no pieces left on the board:</strong> each side adds the strength of its strongest remaining piece to its score, then scores are compared.",
              "<strong>The game reaches 200 moves:</strong> scores are compared. If tied, the game checks how far pieces have advanced toward the exit, then their strength.",
            ],
            tip: "<strong>Important detail:</strong> the Sentinel’s instant win only applies if it is truly the very first piece to exit.",
            caption: "Sentinel exits first: immediate victory",
            hint: "Click and drag to rotate",
          },
          {
            label: "08 · YOUR TURN",
            title: "How to play, step by step",
            paragraphs: [
              "If you have no legal move, the game automatically skips your turn.",
              "The player icon switches between bot and two-player mode. The new-board button creates a fresh map with different terrain.",
            ],
            bullets: [
              "<strong>Click one of your pieces.</strong> Possible destinations are highlighted.",
              "<strong>Click a highlighted destination.</strong> The move, attack, or exit happens immediately.",
              "<strong>Check terrain height and nearby pieces.</strong> An expensive route can still be useful, but always check combat outcomes.",
              "<strong>Rotate the camera</strong> by dragging your mouse or finger across the board.",
            ],
            tip: "<strong>First-game tip:</strong> try moving an Explorer, check the cost shown on the squares, then gradually advance your other pieces.",
            caption: "Select a piece, then a highlighted destination",
            hint: "Click and drag to rotate",
          },
        ],
      },
      game: {
        light: "Light",
        dark: "Dark",
        move: "move",
        movement: "movement",
        strength: "strength",
        pieceInfo: "{{piece}} · movement {{movement}} · strength {{strength}}",
        playerTurn: "Player {{player}} ({{side}}) to move",
        yourTurn: "Your turn",
        botThinking: "The bot is thinking…",
        draw: "Draw",
        playerWins: "Player {{player}} wins",
        victory: "Victory!",
        defeat: "Defeat",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported: "3D visuals require a WebGL-compatible browser.",
        selectSkin: "Select Sentinel skin: {{name}}",
      },
    },
    es: {
      rules: {
        header: {
          language: "Idioma",
          kicker: "APRENDE A JUGAR",
          title: "Descubre Traversal",
          subtitle:
            "Aprende paso a paso. Gira cada ejemplo 3D para entender mejor las reglas.",
          close: "Cerrar el tutorial",
          progress: "Progreso del tutorial",
          track:
            "Pasos del tutorial. Usa las flechas o la rueda del ratón para navegar.",
          guide: "LA GUÍA",
          previous: "Paso anterior",
          next: "Paso siguiente",
          skipStartup: "No mostrar al iniciar",
          skinTitle: "Elegir aspecto de pieza",
          closeSkin: "Cerrar selección de aspectos",
          openRules: "Abrir las reglas del juego",
          openSkins: "Abrir aspectos",
          newBoard: "Crear un tablero nuevo",
          modeBot: "Jugar contra el bot",
          modePlayers: "Cambiar al modo de dos jugadores",
          soundOn: "Silenciar sonido",
          soundOff: "Activar sonido",
        },
        slides: [
          {
            label: "01 · EL OBJETIVO",
            title: "Llega al borde opuesto",
            paragraphs: [
              "Juegas en un tablero de <strong>10 × 10 casillas</strong>. Algunas casillas están más elevadas que otras, así que el terreno importa en Traversal.",
              "Cada bando empieza con <strong>seis piezas</strong>. Parten de bordes opuestos y deben llegar al borde rival. En solitario controlas las piezas claras contra el bot; en el modo de dos jugadores, cada persona controla un bando.",
            ],
            tip: "<strong>Para empezar:</strong> aprende primero los movimientos. Una buena ruta puede darte puntos y ayudarte a evitar combates arriesgados.",
            caption: "Tablero 10 × 10 · dos bandos · seis piezas por bando",
            hint: "Haz clic y arrastra para girar",
          },
          {
            label: "02 · TUS PIEZAS",
            title: "Tres piezas, tres estilos",
            paragraphs: [
              "El movimiento indica el presupuesto de una ruta normal. La fuerza se usa en combate y determina los puntos que consigue una pieza al salir.",
            ],
            stats: [
              {
                line1: "Movimiento 5 · Fuerza 1",
                line2: "Avanza lejos y tiene dos movimientos especiales.",
              },
              {
                line1: "Movimiento 4 · Fuerza 2",
                line2:
                  "Obtiene +1 de ataque si la ruta de ataque cuesta exactamente 4 puntos.",
              },
              {
                line1: "Movimiento 3 · Fuerza 3",
                line2:
                  "Es la pieza más fuerte. Si sale primero, su bando gana.",
              },
            ],
            tip: "<strong>La diferencia:</strong> cuanto más fuerte es una pieza, menos distancia recorre en un movimiento normal.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Gira las piezas para verlas",
          },
          {
            label: "03 · MOVIMIENTO",
            title: "El terreno cambia el coste",
            paragraphs: [
              "El movimiento normal va de una casilla adyacente a otra, <strong>en horizontal o vertical</strong>. Puedes encadenar pasos mientras tengas puntos suficientes.",
              "Un paso a la misma altura cuesta <strong>1 punto</strong>. Con un nivel de diferencia cuesta <strong>2 puntos</strong>; con dos niveles, <strong>3 puntos</strong>. Suma el coste de cada paso.",
              "Una pieza bloquea el paso: no puedes atravesar una casilla ocupada durante una ruta normal. Puedes atacar a un enemigo si el juego muestra su casilla como destino posible.",
            ],
            tip: "<strong>Ejemplo:</strong> subir dos niveles de altura en un solo paso cuesta 3 puntos.",
            caption:
              "Los escalones y las pendientes pueden consumir más movimiento",
            hint: "Gira la escena para comparar las alturas",
          },
          {
            label: "04 · EL EXPLORER",
            title: "Tiene dos atajos",
            paragraphs: [
              "El Explorer puede moverse de forma especial <strong>una casilla en diagonal</strong>. También puede saltar <strong>dos casillas en línea recta</strong>, horizontal o verticalmente.",
              "Para saltar, la casilla entre el origen y el destino debe estar <strong>vacía</strong>. Si hay una pieza, el salto queda bloqueado. Estos movimientos especiales no usan el coste normal del terreno.",
            ],
            tip: "<strong>Atención:</strong> el Explorer es rápido, pero solo tiene fuerza 1. No lo envíes solo contra una pieza más fuerte.",
            caption:
              "Amarillo: diagonal · Cian: salto válido · Rojo: salto bloqueado",
            hint: "Haz clic y arrastra para girar",
          },
          {
            label: "05 · COMBATE",
            title: "Mira alrededor antes de atacar",
            paragraphs: [
              "Cuando una casilla enemiga aparece como destino, el juego compara ataque y defensa. El terreno y las piezas cercanas pueden cambiar el resultado.",
              "Si el ataque iguala o supera la defensa, tiene éxito y la pieza objetivo se retira del tablero.",
            ],
            bullets: [
              "Si el atacante está más alto que su objetivo, obtiene <strong>+1</strong>; si está más bajo, recibe <strong>−1</strong>.",
              "Cada aliado junto al objetivo añade su <strong>fuerza</strong> al ataque.",
              "Cada defensor aliado junto al objetivo añade <strong>+1</strong> a la defensa.",
              "El Vanguard obtiene otro <strong>+1 de ataque</strong> si la ruta completa de ataque cuesta exactamente 4 puntos.",
            ],
            tip: "<strong>Ejemplo:</strong> un Sentinel elevado (3, +1), apoyado por un Explorer aliado (+1), ataca con 5. Un defensor con 4 pierde.",
            caption: "El terreno y el apoyo cercano cambian el resultado",
            hint: "Gira la escena para ver las posiciones",
          },
          {
            label: "06 · SALIR Y PUNTUAR",
            title: "La fuerza de la pieza se convierte en puntos",
            paragraphs: [
              "Saca tus piezas por el borde opuesto. Cuando una pieza sale, abandona la partida y su bando suma tantos puntos como indica su fuerza.",
              "Una pieza que sale ya no puede moverse ni luchar. Cuidado: un Sentinel puede ganar la partida de inmediato según cuándo salga.",
            ],
            scores: ["1 punto", "2 puntos", "3 puntos"],
            tip: "<strong>Elige tu plan:</strong> el Explorer puntúa menos, pero es más rápido. El Sentinel vale mucho y cuesta más sacarlo.",
            caption: "La pieza que cruza el borde se retira y añade sus puntos",
            hint: "Gira la escena para ver la salida",
          },
          {
            label: "07 · FIN DE LA PARTIDA",
            title: "¿Cómo se gana?",
            paragraphs: [
              "La partida termina cuando ocurre una de estas situaciones:",
            ],
            bullets: [
              "<strong>La primera pieza que sale es un Sentinel:</strong> su bando gana inmediatamente.",
              "<strong>Han salido dos piezas en total:</strong> gana el bando con más puntos. Si empatan, la partida termina en tablas.",
              "<strong>Un bando se queda sin piezas en el tablero:</strong> cada bando suma la fuerza de su pieza restante más fuerte y después se comparan las puntuaciones.",
              "<strong>La partida llega a 200 movimientos:</strong> se comparan las puntuaciones. Si hay empate, se mira el avance hacia la salida y después la fuerza.",
            ],
            tip: "<strong>Importante:</strong> la victoria instantánea del Sentinel solo se aplica si es realmente la primera pieza que sale.",
            caption: "El Sentinel sale primero: victoria inmediata",
            hint: "Haz clic y arrastra para girar",
          },
          {
            label: "08 · TU TURNO",
            title: "Cómo jugar, paso a paso",
            paragraphs: [
              "Si no tienes ningún movimiento legal, el juego pasa tu turno automáticamente.",
              "El botón de jugadores cambia entre el bot y dos jugadores. El botón de tablero nuevo genera un mapa con un terreno diferente.",
            ],
            bullets: [
              "<strong>Haz clic en una de tus piezas.</strong> Se resaltan los destinos posibles.",
              "<strong>Haz clic en un destino resaltado.</strong> El movimiento, ataque o salida ocurre de inmediato.",
              "<strong>Observa la altura del terreno y las piezas cercanas.</strong> Una ruta costosa puede ser útil, pero comprueba siempre el resultado del combate.",
              "<strong>Gira la cámara</strong> arrastrando el ratón o el dedo sobre el tablero.",
            ],
            tip: "<strong>Consejo para tu primera partida:</strong> mueve un Explorer, revisa el coste de las casillas y avanza poco a poco con las demás piezas.",
            caption: "Selecciona una pieza y después un destino resaltado",
            hint: "Haz clic y arrastra para girar",
          },
        ],
      },
      game: {
        light: "Claras",
        dark: "Oscuras",
        move: "movimiento",
        movement: "movimiento",
        strength: "fuerza",
        pieceInfo: "{{piece}} · movimiento {{movement}} · fuerza {{strength}}",
        playerTurn: "Turno del jugador {{player}} ({{side}})",
        yourTurn: "Tu turno",
        botThinking: "El bot está pensando…",
        draw: "Empate",
        playerWins: "Gana el jugador {{player}}",
        victory: "¡Victoria!",
        defeat: "Derrota",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported:
          "Los elementos visuales 3D requieren un navegador compatible con WebGL.",
        selectSkin: "Elegir aspecto Sentinel: {{name}}",
      },
    },
    de: {
      rules: {
        header: {
          language: "Sprache",
          kicker: "SPIELEN LERNEN",
          title: "Traversal entdecken",
          subtitle:
            "Lerne Schritt für Schritt. Drehe jedes 3D-Beispiel, um die Regeln besser zu verstehen.",
          close: "Tutorial schließen",
          progress: "Tutorial-Fortschritt",
          track: "Tutorial-Schritte. Mit Pfeiltasten oder Mausrad navigieren.",
          guide: "ANLEITUNG",
          previous: "Vorheriger Schritt",
          next: "Nächster Schritt",
          skipStartup: "Beim Start nicht mehr anzeigen",
          skinTitle: "Figuren-Skin auswählen",
          closeSkin: "Skin-Auswahl schließen",
          openRules: "Spielregeln öffnen",
          openSkins: "Skins öffnen",
          newBoard: "Neues Spielfeld erstellen",
          modeBot: "Gegen den Bot spielen",
          modePlayers: "Zum Zwei-Spieler-Modus wechseln",
          soundOn: "Ton ausschalten",
          soundOff: "Ton einschalten",
        },
        slides: [
          {
            label: "01 · DAS ZIEL",
            title: "Erreiche die gegenüberliegende Seite",
            paragraphs: [
              "Du spielst auf einem <strong>10 × 10 Felder</strong> großen Brett. Manche Felder liegen höher als andere – das Gelände spielt in Traversal eine wichtige Rolle.",
              "Jede Seite beginnt mit <strong>sechs Figuren</strong>. Sie starten an gegenüberliegenden Rändern und müssen den gegnerischen Rand erreichen. Im Einzelspiel steuerst du die hellen Figuren gegen den Bot; zu zweit kontrolliert jeder eine Seite.",
            ],
            tip: "<strong>Zum Start:</strong> Lerne zuerst die Bewegungsregeln. Ein guter Weg kann Punkte bringen und riskante Kämpfe vermeiden.",
            caption: "10 × 10 Brett · zwei Seiten · je sechs Figuren",
            hint: "Klicken und ziehen, um zu drehen",
          },
          {
            label: "02 · DEINE FIGUREN",
            title: "Drei Figuren, drei Spielweisen",
            paragraphs: [
              "Bewegung ist das Budget für einen normalen Weg. Stärke zählt im Kampf und bestimmt die Punkte, die eine Figur beim Verlassen des Bretts erzielt.",
            ],
            stats: [
              {
                line1: "Bewegung 5 · Stärke 1",
                line2: "Kommt weit und hat zwei Spezialzüge.",
              },
              {
                line1: "Bewegung 4 · Stärke 2",
                line2:
                  "Erhält +1 Angriff, wenn der Angriffsweg genau 4 Punkte kostet.",
              },
              {
                line1: "Bewegung 3 · Stärke 3",
                line2:
                  "Die stärkste Figur. Verlässt sie das Brett zuerst, gewinnt ihre Seite.",
              },
            ],
            tip: "<strong>Der Kompromiss:</strong> Je stärker eine Figur ist, desto kürzer ist ihr normaler Zug.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Drehe die Figuren, um sie anzusehen",
          },
          {
            label: "03 · BEWEGUNG",
            title: "Das Gelände verändert die Kosten",
            paragraphs: [
              "Normale Züge gehen von einem benachbarten Feld zum nächsten, <strong>waagerecht oder senkrecht</strong>. Du kannst mehrere Schritte verbinden, solange du genug Bewegungspunkte hast.",
              "Ein Schritt auf gleicher Höhe kostet <strong>1 Punkt</strong>. Bei einem Höhenunterschied von einer Stufe kostet er <strong>2 Punkte</strong>, bei zwei Stufen <strong>3 Punkte</strong>. Addiere die Kosten aller Schritte.",
              "Eine Figur blockiert den Weg: Während eines normalen Zuges kannst du kein besetztes Feld durchqueren. Ein Gegner kann angegriffen werden, wenn das Spiel sein Feld als mögliches Ziel markiert.",
            ],
            tip: "<strong>Beispiel:</strong> Zwei Höhenstufen auf einmal zu erklimmen kostet für diesen Schritt 3 Punkte.",
            caption: "Stufen und Hänge können mehr Bewegung kosten",
            hint: "Drehe die Szene, um Höhen zu vergleichen",
          },
          {
            label: "04 · DER EXPLORER",
            title: "Er hat zwei Abkürzungen",
            paragraphs: [
              "Der Explorer kann sich speziell <strong>ein Feld diagonal</strong> bewegen. Außerdem kann er <strong>zwei Felder geradeaus springen</strong>, waagerecht oder senkrecht.",
              "Beim Sprung muss das Feld zwischen Start und Ziel <strong>frei</strong> sein. Steht dort eine Figur, ist der Sprung blockiert. Diese Spezialzüge verwenden nicht die üblichen Geländekosten.",
            ],
            tip: "<strong>Achtung:</strong> Der Explorer ist schnell, hat aber nur Stärke 1. Schicke ihn nicht allein gegen eine stärkere Figur.",
            caption:
              "Gelb: diagonal · Cyan: freier Sprung · Rot: blockierter Sprung",
            hint: "Klicken und ziehen, um zu drehen",
          },
          {
            label: "05 · KÄMPFE",
            title: "Sieh dich vor einem Angriff um",
            paragraphs: [
              "Wenn ein gegnerisches Feld als Ziel angeboten wird, vergleicht das Spiel Angriff und Verteidigung. Gelände und benachbarte Figuren können entscheidend sein.",
              "Ist der Angriff mindestens so hoch wie die Verteidigung, gelingt er und die Zielfigur wird vom Brett entfernt.",
            ],
            bullets: [
              "Steht der Angreifer höher als sein Ziel, erhält er <strong>+1</strong>; steht er tiefer, erhält er <strong>−1</strong>.",
              "Jede verbündete Figur direkt neben dem Ziel addiert ihre <strong>Stärke</strong> zum Angriff.",
              "Jede verteidigende verbündete Figur direkt neben dem Ziel gibt der Verteidigung <strong>+1</strong>.",
              "Der Vanguard erhält zusätzlich <strong>+1 Angriff</strong>, wenn der gesamte Angriffsweg genau 4 Punkte kostet.",
            ],
            tip: "<strong>Beispiel:</strong> Ein erhöhter Sentinel (3, +1) greift mit Unterstützung eines Explorers (+1) mit Stärke 5 an. Eine Verteidigung von 4 verliert.",
            caption:
              "Gelände und Unterstützung in der Nähe verändern das Ergebnis",
            hint: "Drehe die Szene, um die Positionen zu sehen",
          },
          {
            label: "06 · AUSTRETEN UND PUNKTEN",
            title: "Die Stärke einer Figur wird zu Punkten",
            paragraphs: [
              "Bringe deine Figuren über den gegenüberliegenden Rand. Verlässt eine Figur das Brett, scheidet sie aus und ihre Seite erhält Punkte in Höhe ihrer Stärke.",
              "Eine ausgeschiedene Figur kann sich nicht mehr bewegen oder kämpfen. Vorsicht: Ein Sentinel kann sofort gewinnen, abhängig davon, wann er das Brett verlässt.",
            ],
            scores: ["1 Punkt", "2 Punkte", "3 Punkte"],
            tip: "<strong>Wähle deine Strategie:</strong> Ein Explorer bringt weniger Punkte, ist aber schneller. Ein Sentinel ist wertvoller und schwerer hinauszubringen.",
            caption:
              "Eine Figur am Rand wird entfernt und ihre Punkte werden addiert",
            hint: "Drehe die Szene, um den Ausgang zu sehen",
          },
          {
            label: "07 · SPIELENDE",
            title: "Wie gewinnt man?",
            paragraphs: [
              "Das Spiel endet, sobald eine dieser Situationen eintritt:",
            ],
            bullets: [
              "<strong>Die erste Figur, die austritt, ist ein Sentinel:</strong> Ihre Seite gewinnt sofort.",
              "<strong>Insgesamt sind zwei Figuren ausgetreten:</strong> Die Seite mit mehr Punkten gewinnt. Bei Gleichstand endet das Spiel unentschieden.",
              "<strong>Eine Seite hat keine Figuren mehr auf dem Brett:</strong> Jede Seite addiert die Stärke ihrer stärksten verbliebenen Figur; anschließend werden die Punkte verglichen.",
              "<strong>Das Spiel erreicht 200 Züge:</strong> Die Punkte werden verglichen. Bei Gleichstand zählen zuerst der Fortschritt zum Ausgang und dann die Stärke.",
            ],
            tip: "<strong>Wichtig:</strong> Der sofortige Sieg des Sentinels gilt nur, wenn er wirklich als allererste Figur austritt.",
            caption: "Sentinel tritt zuerst aus: sofortiger Sieg",
            hint: "Klicken und ziehen, um zu drehen",
          },
          {
            label: "08 · DU BIST DRAN",
            title: "So spielst du Schritt für Schritt",
            paragraphs: [
              "Wenn du keinen legalen Zug hast, setzt das Spiel deinen Zug automatisch aus.",
              "Mit der Spieler-Schaltfläche wechselst du zwischen Bot und zwei Spielern. Die Schaltfläche für ein neues Brett erstellt eine Karte mit anderem Gelände.",
            ],
            bullets: [
              "<strong>Klicke auf eine deiner Figuren.</strong> Mögliche Ziele werden hervorgehoben.",
              "<strong>Klicke auf ein hervorgehobenes Ziel.</strong> Zug, Angriff oder Austritt erfolgen sofort.",
              "<strong>Beachte Höhen und benachbarte Figuren.</strong> Ein teurer Weg kann sinnvoll sein, aber prüfe immer den Kampfausgang.",
              "<strong>Drehe die Kamera</strong>, indem du die Maus oder deinen Finger über das Brett ziehst.",
            ],
            tip: "<strong>Tipp für dein erstes Spiel:</strong> Bewege einen Explorer, prüfe die angezeigten Feldkosten und rücke dann nach und nach mit deinen anderen Figuren vor.",
            caption: "Wähle eine Figur und dann ein markiertes Ziel",
            hint: "Klicken und ziehen, um zu drehen",
          },
        ],
      },
      game: {
        light: "Hell",
        dark: "Dunkel",
        move: "Zug",
        movement: "Bewegung",
        strength: "Stärke",
        pieceInfo: "{{piece}} · Bewegung {{movement}} · Stärke {{strength}}",
        playerTurn: "Spieler {{player}} ({{side}}) ist am Zug",
        yourTurn: "Du bist am Zug",
        botThinking: "Der Bot denkt nach…",
        draw: "Unentschieden",
        playerWins: "Spieler {{player}} gewinnt",
        victory: "Sieg!",
        defeat: "Niederlage",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported:
          "3D-Ansichten benötigen einen WebGL-kompatiblen Browser.",
        selectSkin: "Sentinel-Skin auswählen: {{name}}",
      },
    },
    it: {
      rules: {
        header: {
          language: "Lingua",
          kicker: "IMPARA A GIOCARE",
          title: "Scopri Traversal",
          subtitle:
            "Impara passo dopo passo. Ruota ogni esempio 3D per capire meglio le regole.",
          close: "Chiudi il tutorial",
          progress: "Avanzamento del tutorial",
          track:
            "Passaggi del tutorial. Usa le frecce o la rotellina per navigare.",
          guide: "LA GUIDA",
          previous: "Passaggio precedente",
          next: "Passaggio successivo",
          skipStartup: "Non mostrare all’avvio",
          skinTitle: "Scegli una skin per il pezzo",
          closeSkin: "Chiudi la selezione delle skin",
          openRules: "Apri le regole del gioco",
          openSkins: "Apri le skin",
          newBoard: "Crea una nuova scacchiera",
          modeBot: "Gioca contro il bot",
          modePlayers: "Passa alla modalità a due giocatori",
          soundOn: "Disattiva audio",
          soundOff: "Attiva audio",
        },
        slides: [
          {
            label: "01 · L’OBIETTIVO",
            title: "Raggiungi il bordo opposto",
            paragraphs: [
              "Giochi su una scacchiera di <strong>10 × 10 caselle</strong>. Alcune caselle sono più alte di altre: il terreno è importante in Traversal.",
              "Ogni schieramento inizia con <strong>sei pezzi</strong>. Partono da bordi opposti e devono raggiungere quello avversario. In solitaria controlli i pezzi chiari contro il bot; in due, ogni giocatore controlla uno schieramento.",
            ],
            tip: "<strong>Per iniziare:</strong> impara prima i movimenti. Un buon percorso può farti guadagnare punti ed evitare combattimenti rischiosi.",
            caption:
              "Scacchiera 10 × 10 · due schieramenti · sei pezzi ciascuno",
            hint: "Fai clic e trascina per ruotare",
          },
          {
            label: "02 · I TUOI PEZZI",
            title: "Tre pezzi, tre stili di gioco",
            paragraphs: [
              "Il movimento è il budget di un percorso normale. La forza serve nei combattimenti e determina i punti ottenuti quando un pezzo esce.",
            ],
            stats: [
              {
                line1: "Movimento 5 · Forza 1",
                line2: "Si sposta lontano e ha due mosse speciali.",
              },
              {
                line1: "Movimento 4 · Forza 2",
                line2:
                  "Ottiene +1 in attacco se il percorso d’attacco costa esattamente 4 punti.",
              },
              {
                line1: "Movimento 3 · Forza 3",
                line2:
                  "È il pezzo più forte. Se esce per primo, il suo schieramento vince.",
              },
            ],
            tip: "<strong>Il compromesso:</strong> più un pezzo è forte, meno lontano arriva con una mossa normale.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Ruota i pezzi per osservarli",
          },
          {
            label: "03 · MOVIMENTO",
            title: "Il terreno cambia il costo",
            paragraphs: [
              "Il movimento normale va da una casella adiacente a un’altra, <strong>in orizzontale o verticale</strong>. Puoi concatenare più passi finché hai punti sufficienti.",
              "Un passo alla stessa altezza costa <strong>1 punto</strong>. Con un livello di differenza costa <strong>2 punti</strong>; con due livelli <strong>3 punti</strong>. Somma il costo di ogni passo.",
              "Un pezzo blocca il passaggio: durante un percorso normale non puoi attraversare una casella occupata. Puoi attaccare un nemico se il gioco mostra la sua casella come destinazione possibile.",
            ],
            tip: "<strong>Esempio:</strong> salire di due livelli in un solo passo costa 3 punti.",
            caption: "Gradini e pendenze possono consumare più movimento",
            hint: "Ruota la scena per confrontare le altezze",
          },
          {
            label: "04 · L’EXPLORER",
            title: "Ha due scorciatoie",
            paragraphs: [
              "L’Explorer può fare una mossa speciale di <strong>una casella in diagonale</strong>. Può anche saltare <strong>due caselle in linea retta</strong>, in orizzontale o in verticale.",
              "Per saltare, la casella tra partenza e arrivo deve essere <strong>vuota</strong>. Se è occupata da un pezzo, il salto è bloccato. Queste mosse speciali ignorano il normale costo del terreno.",
            ],
            tip: "<strong>Attenzione:</strong> l’Explorer è veloce, ma ha solo forza 1. Evita di mandarlo da solo contro un pezzo più forte.",
            caption:
              "Giallo: diagonale · Ciano: salto valido · Rosso: salto bloccato",
            hint: "Fai clic e trascina per ruotare",
          },
          {
            label: "05 · COMBATTIMENTI",
            title: "Guarda intorno prima di attaccare",
            paragraphs: [
              "Quando una casella nemica è proposta come destinazione, il gioco confronta attacco e difesa. Terreno e pezzi vicini possono fare la differenza.",
              "Se l’attacco eguaglia o supera la difesa, riesce e il pezzo bersaglio viene rimosso dalla scacchiera.",
            ],
            bullets: [
              "Se l’attaccante è più in alto del bersaglio, ottiene <strong>+1</strong>; se è più in basso, perde <strong>−1</strong>.",
              "Ogni alleato accanto al bersaglio aggiunge la propria <strong>forza</strong> all’attacco.",
              "Ogni difensore alleato accanto al bersaglio aggiunge <strong>+1</strong> alla difesa.",
              "Il Vanguard ottiene un altro <strong>+1 in attacco</strong> se il percorso d’attacco completo costa esattamente 4 punti.",
            ],
            tip: "<strong>Esempio:</strong> un Sentinel in altura (3, +1), aiutato da un Explorer alleato (+1), attacca con 5. Un difensore con 4 viene sconfitto.",
            caption: "Terreno e supporto vicino cambiano il risultato",
            hint: "Ruota la scena per vedere le posizioni",
          },
          {
            label: "06 · USCIRE E FARE PUNTI",
            title: "La forza del pezzo diventa punti",
            paragraphs: [
              "Porta i tuoi pezzi oltre il bordo opposto. Quando un pezzo esce, lascia la partita e il suo schieramento ottiene punti pari alla sua forza.",
              "Un pezzo uscito non può più muoversi né combattere. Attenzione: un Sentinel può vincere subito, a seconda di quando esce.",
            ],
            scores: ["1 punto", "2 punti", "3 punti"],
            tip: "<strong>Scegli la strategia:</strong> l’Explorer fa meno punti ma è più veloce. Il Sentinel è prezioso e più difficile da far uscire.",
            caption:
              "Il pezzo che supera il bordo viene rimosso e assegna punti",
            hint: "Ruota la scena per vedere l’uscita",
          },
          {
            label: "07 · FINE DELLA PARTITA",
            title: "Come si vince?",
            paragraphs: [
              "La partita termina quando si verifica una di queste situazioni:",
            ],
            bullets: [
              "<strong>Il primo pezzo a uscire è un Sentinel:</strong> il suo schieramento vince subito.",
              "<strong>Sono usciti due pezzi in totale:</strong> vince chi ha più punti. In caso di parità, la partita finisce in pareggio.",
              "<strong>Uno schieramento non ha più pezzi sulla scacchiera:</strong> ogni schieramento aggiunge al punteggio la forza del pezzo rimasto più forte, poi si confrontano i punti.",
              "<strong>La partita raggiunge 200 mosse:</strong> si confrontano i punteggi. In caso di parità, conta l’avanzamento verso l’uscita e poi la forza.",
            ],
            tip: "<strong>Dettaglio importante:</strong> la vittoria immediata del Sentinel vale solo se è davvero il primo pezzo a uscire.",
            caption: "Il Sentinel esce per primo: vittoria immediata",
            hint: "Fai clic e trascina per ruotare",
          },
          {
            label: "08 · TOCCA A TE",
            title: "Come giocare, passo dopo passo",
            paragraphs: [
              "Se non hai mosse legali, il gioco salta automaticamente il tuo turno.",
              "Il pulsante dei giocatori alterna bot e modalità a due giocatori. Il pulsante per una nuova scacchiera crea una mappa con terreno diverso.",
            ],
            bullets: [
              "<strong>Fai clic su un tuo pezzo.</strong> Le destinazioni possibili vengono evidenziate.",
              "<strong>Fai clic su una destinazione evidenziata.</strong> Movimento, attacco o uscita avvengono subito.",
              "<strong>Osserva l’altezza e i pezzi vicini.</strong> Un percorso costoso può essere utile, ma controlla sempre il risultato del combattimento.",
              "<strong>Ruota la telecamera</strong> trascinando il mouse o il dito sulla scacchiera.",
            ],
            tip: "<strong>Consiglio per la prima partita:</strong> prova a muovere un Explorer, controlla il costo delle caselle e avanza gradualmente con gli altri pezzi.",
            caption: "Seleziona un pezzo, poi una destinazione evidenziata",
            hint: "Fai clic e trascina per ruotare",
          },
        ],
      },
      game: {
        light: "Chiare",
        dark: "Scure",
        move: "mossa",
        movement: "movimento",
        strength: "forza",
        pieceInfo: "{{piece}} · movimento {{movement}} · forza {{strength}}",
        playerTurn: "Tocca al giocatore {{player}} ({{side}})",
        yourTurn: "Tocca a te",
        botThinking: "Il bot sta pensando…",
        draw: "Patta",
        playerWins: "Vince il giocatore {{player}}",
        victory: "Vittoria!",
        defeat: "Sconfitta",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported:
          "Le visualizzazioni 3D richiedono un browser compatibile con WebGL.",
        selectSkin: "Scegli skin Sentinel: {{name}}",
      },
    },
    pt: {
      rules: {
        header: {
          language: "Idioma",
          kicker: "APRENDA A JOGAR",
          title: "Descubra Traversal",
          subtitle:
            "Aprenda passo a passo. Rode cada exemplo 3D para compreender melhor as regras.",
          close: "Fechar tutorial",
          progress: "Progresso do tutorial",
          track:
            "Etapas do tutorial. Use as setas ou a roda do rato para navegar.",
          guide: "O GUIA",
          previous: "Etapa anterior",
          next: "Próxima etapa",
          skipStartup: "Não mostrar ao iniciar",
          skinTitle: "Escolher visual da peça",
          closeSkin: "Fechar seleção de visuais",
          openRules: "Abrir as regras do jogo",
          openSkins: "Abrir visuais",
          newBoard: "Criar um novo tabuleiro",
          modeBot: "Jogar contra o bot",
          modePlayers: "Mudar para dois jogadores",
          soundOn: "Silenciar som",
          soundOff: "Ativar som",
        },
        slides: [
          {
            label: "01 · O OBJETIVO",
            title: "Chegue à borda oposta",
            paragraphs: [
              "Você joga num tabuleiro de <strong>10 × 10 casas</strong>. Algumas casas são mais altas que outras, por isso o relevo é importante em Traversal.",
              "Cada lado começa com <strong>seis peças</strong>. Elas partem de bordas opostas e devem chegar à borda adversária. No modo solo, você controla as peças claras contra o bot; no modo para dois jogadores, cada pessoa controla um lado.",
            ],
            tip: "<strong>Para começar:</strong> aprenda primeiro os movimentos. Um bom caminho pode render pontos e evitar combates arriscados.",
            caption: "Tabuleiro 10 × 10 · dois lados · seis peças cada",
            hint: "Clique e arraste para rodar",
          },
          {
            label: "02 · AS SUAS PEÇAS",
            title: "Três peças, três estilos",
            paragraphs: [
              "O movimento é o orçamento de um percurso normal. A força é usada nos combates e determina os pontos que uma peça recebe ao sair.",
            ],
            stats: [
              {
                line1: "Movimento 5 · Força 1",
                line2: "Avança longe e tem dois movimentos especiais.",
              },
              {
                line1: "Movimento 4 · Força 2",
                line2:
                  "Recebe +1 no ataque quando o percurso custa exatamente 4 pontos.",
              },
              {
                line1: "Movimento 3 · Força 3",
                line2:
                  "É a peça mais forte. Se sair primeiro, o seu lado vence.",
              },
            ],
            tip: "<strong>O equilíbrio:</strong> quanto mais forte é uma peça, menos distância percorre num movimento normal.",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "Rode as peças para as observar",
          },
          {
            label: "03 · MOVIMENTO",
            title: "O relevo altera o custo",
            paragraphs: [
              "O movimento normal passa de uma casa adjacente para outra, <strong>na horizontal ou vertical</strong>. Pode combinar vários passos enquanto tiver pontos suficientes.",
              "Um passo à mesma altura custa <strong>1 ponto</strong>. Uma diferença de um nível custa <strong>2 pontos</strong>; dois níveis custam <strong>3 pontos</strong>. Some o custo de cada passo.",
              "Uma peça bloqueia a passagem: não pode atravessar uma casa ocupada durante um percurso normal. Pode atacar uma peça inimiga se o jogo mostrar a casa como destino possível.",
            ],
            tip: "<strong>Exemplo:</strong> subir dois níveis num único passo custa 3 pontos.",
            caption: "Degraus e inclinações podem consumir mais movimento",
            hint: "Rode a cena para comparar as alturas",
          },
          {
            label: "04 · O EXPLORER",
            title: "Tem dois atalhos",
            paragraphs: [
              "O Explorer pode fazer um movimento especial de <strong>uma casa na diagonal</strong>. Também pode saltar <strong>duas casas em linha reta</strong>, na horizontal ou vertical.",
              "Para saltar, a casa entre a origem e o destino deve estar <strong>vazia</strong>. Se houver uma peça, o salto fica bloqueado. Estes movimentos especiais ignoram o custo habitual do relevo.",
            ],
            tip: "<strong>Atenção:</strong> o Explorer é rápido, mas só tem força 1. Evite enviá-lo sozinho contra uma peça mais forte.",
            caption:
              "Amarelo: diagonal · Ciano: salto válido · Vermelho: salto bloqueado",
            hint: "Clique e arraste para rodar",
          },
          {
            label: "05 · COMBATES",
            title: "Observe antes de atacar",
            paragraphs: [
              "Quando uma casa inimiga é indicada como destino, o jogo compara ataque e defesa. O relevo e as peças próximas podem mudar o resultado.",
              "Se o ataque igualar ou superar a defesa, será bem-sucedido e a peça alvo será removida do tabuleiro.",
            ],
            bullets: [
              "Se o atacante estiver acima do alvo, recebe <strong>+1</strong>; se estiver abaixo, recebe <strong>−1</strong>.",
              "Cada aliado junto ao alvo acrescenta a sua <strong>força</strong> ao ataque.",
              "Cada defensor aliado junto ao alvo acrescenta <strong>+1</strong> à defesa.",
              "O Vanguard recebe mais <strong>+1 de ataque</strong> se o percurso de ataque custar exatamente 4 pontos.",
            ],
            tip: "<strong>Exemplo:</strong> um Sentinel elevado (3, +1), apoiado por um Explorer aliado (+1), ataca com 5. Um defensor com 4 perde.",
            caption: "O terreno e o apoio próximo alteram o resultado",
            hint: "Rode a cena para ver as posições",
          },
          {
            label: "06 · SAIR E PONTUAR",
            title: "A força da peça transforma-se em pontos",
            paragraphs: [
              "Leve as suas peças para fora pela borda oposta. Quando uma peça sai, abandona a partida e o seu lado recebe pontos iguais à sua força.",
              "Uma peça que saiu já não pode mover-se nem combater. Atenção: um Sentinel pode vencer imediatamente, dependendo do momento em que sai.",
            ],
            scores: ["1 ponto", "2 pontos", "3 pontos"],
            tip: "<strong>Escolha a sua estratégia:</strong> o Explorer marca menos pontos, mas é mais rápido. O Sentinel é valioso e mais difícil de retirar.",
            caption:
              "A peça que atravessa a borda é removida e os pontos são somados",
            hint: "Rode a cena para ver a saída",
          },
          {
            label: "07 · FIM DA PARTIDA",
            title: "Como vencer?",
            paragraphs: [
              "A partida termina assim que uma destas situações ocorrer:",
            ],
            bullets: [
              "<strong>A primeira peça a sair é um Sentinel:</strong> o seu lado vence imediatamente.",
              "<strong>Duas peças saíram no total:</strong> vence o lado com mais pontos. Em caso de empate, a partida termina empatada.",
              "<strong>Um lado fica sem peças no tabuleiro:</strong> cada lado soma ao resultado a força da sua peça restante mais forte; depois, os pontos são comparados.",
              "<strong>A partida chega a 200 jogadas:</strong> comparam-se os pontos. Em caso de empate, conta o avanço em direção à saída e depois a força.",
            ],
            tip: "<strong>Importante:</strong> a vitória instantânea do Sentinel só vale se ele for realmente a primeira peça a sair.",
            caption: "O Sentinel sai primeiro: vitória imediata",
            hint: "Clique e arraste para rodar",
          },
          {
            label: "08 · A SUA VEZ",
            title: "Como jogar passo a passo",
            paragraphs: [
              "Se não tiver nenhuma jogada legal, o jogo passa automaticamente a sua vez.",
              "O botão dos jogadores alterna entre bot e dois jogadores. O botão de novo tabuleiro cria um mapa com relevo diferente.",
            ],
            bullets: [
              "<strong>Clique numa das suas peças.</strong> Os destinos possíveis ficam realçados.",
              "<strong>Clique num destino realçado.</strong> O movimento, ataque ou saída acontece imediatamente.",
              "<strong>Observe a altura e as peças próximas.</strong> Um percurso caro pode ser útil, mas confira sempre o resultado do combate.",
              "<strong>Rode a câmara</strong> arrastando o rato ou o dedo sobre o tabuleiro.",
            ],
            tip: "<strong>Dica para a primeira partida:</strong> experimente mover um Explorer, veja o custo das casas e avance gradualmente com as outras peças.",
            caption: "Selecione uma peça e depois um destino realçado",
            hint: "Clique e arraste para rodar",
          },
        ],
      },
      game: {
        light: "Claras",
        dark: "Escuras",
        move: "jogada",
        movement: "movimento",
        strength: "força",
        pieceInfo: "{{piece}} · movimento {{movement}} · força {{strength}}",
        playerTurn: "Vez do jogador {{player}} ({{side}})",
        yourTurn: "A sua vez",
        botThinking: "O bot está a pensar…",
        draw: "Empate",
        playerWins: "O jogador {{player}} vence",
        victory: "Vitória!",
        defeat: "Derrota",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported:
          "As imagens 3D precisam de um navegador compatível com WebGL.",
        selectSkin: "Escolher visual Sentinel: {{name}}",
      },
    },
    ja: {
      rules: {
        header: {
          language: "言語",
          kicker: "遊び方を学ぶ",
          title: "Traversalを始めよう",
          subtitle:
            "ステップごとに学びましょう。3Dの例を回転させると、ルールを理解しやすくなります。",
          close: "チュートリアルを閉じる",
          progress: "チュートリアルの進行状況",
          track:
            "チュートリアルの手順。矢印キーまたはマウスホイールで移動できます。",
          guide: "ガイド",
          previous: "前のステップ",
          next: "次のステップ",
          skipStartup: "起動時に表示しない",
          skinTitle: "駒のスキンを選択",
          closeSkin: "スキン選択を閉じる",
          openRules: "ゲームルールを開く",
          openSkins: "スキンを開く",
          newBoard: "新しい盤面を作成",
          modeBot: "ボットと対戦",
          modePlayers: "2人プレイに切り替え",
          soundOn: "サウンドをミュート",
          soundOff: "サウンドを有効化",
        },
        slides: [
          {
            label: "01 · 目的",
            title: "反対側の端を目指そう",
            paragraphs: [
              "<strong>10 × 10マス</strong>の盤面でプレイします。マスによって高さが異なり、地形がTraversalの重要な要素になります。",
              "各陣営は<strong>6個の駒</strong>で開始します。反対側の端からスタートし、相手側の端を目指します。1人プレイでは明るい駒を操作してボットと対戦し、2人プレイでは各プレイヤーが陣営を操作します。",
            ],
            tip: "<strong>まずは：</strong>移動ルールを覚えましょう。よいルートは得点につながり、危険な戦闘を避ける助けにもなります。",
            caption: "10 × 10の盤面 · 2陣営 · 各6個の駒",
            hint: "クリックしてドラッグすると回転します",
          },
          {
            label: "02 · 駒の種類",
            title: "3種類の駒、それぞれの戦い方",
            paragraphs: [
              "移動力は通常ルートで使えるポイントです。強さは戦闘に使われ、駒が盤外へ出たときの得点を決めます。",
            ],
            stats: [
              {
                line1: "移動力 5 · 強さ 1",
                line2: "遠くまで移動でき、特殊移動が2種類あります。",
              },
              {
                line1: "移動力 4 · 強さ 2",
                line2: "攻撃ルートのコストがちょうど4なら攻撃力が+1されます。",
              },
              {
                line1: "移動力 3 · 強さ 3",
                line2:
                  "最も強い駒です。最初に盤外へ出ると、その陣営が勝利します。",
              },
            ],
            tip: "<strong>覚えておこう：</strong>駒が強いほど、通常移動で進める距離は短くなります。",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "駒を回転させて見てみましょう",
          },
          {
            label: "03 · 移動",
            title: "地形によってコストが変わる",
            paragraphs: [
              "通常移動は隣接するマスへ<strong>横または縦</strong>に進みます。移動ポイントが残っていれば、複数のステップを続けられます。",
              "同じ高さへの移動は<strong>1ポイント</strong>です。高さが1段違うと<strong>2ポイント</strong>、2段違うと<strong>3ポイント</strong>かかります。各ステップのコストを合計します。",
              "駒は通路をふさぎます。通常ルートでは駒のいるマスを通過できません。ゲームで移動先として表示された場合、敵の駒を攻撃できます。",
            ],
            tip: "<strong>例：</strong>一度に高さを2段上がる場合、そのステップだけで3ポイント必要です。",
            caption: "段差や斜面では移動ポイントを多く使います",
            hint: "場面を回転させて高さを比べましょう",
          },
          {
            label: "04 · EXPLORER",
            title: "2つの近道を使える",
            paragraphs: [
              "Explorerは特殊移動で<strong>斜めに1マス</strong>進めます。また、横または縦に<strong>一直線で2マス</strong>ジャンプできます。",
              "ジャンプでは出発地点と目的地の間のマスが<strong>空いている</strong>必要があります。駒があればジャンプできません。特殊移動では通常の地形コストを使いません。",
            ],
            tip: "<strong>注意：</strong>Explorerは速いものの、強さは1しかありません。強い駒に単独で挑まないようにしましょう。",
            caption: "黄色：斜め · シアン：ジャンプ可能 · 赤：ジャンプ不可",
            hint: "クリックしてドラッグすると回転します",
          },
          {
            label: "05 · 戦闘",
            title: "攻撃前に周囲を確認しよう",
            paragraphs: [
              "敵のマスが移動先として表示されると、ゲームは攻撃力と防御力を比較します。地形や近くの駒が結果を左右します。",
              "攻撃力が防御力以上なら攻撃成功となり、対象の駒は盤面から取り除かれます。",
            ],
            bullets: [
              "攻撃側が対象より高ければ<strong>+1</strong>、低ければ<strong>−1</strong>されます。",
              "対象のすぐ隣にいる味方は、それぞれの<strong>強さ</strong>を攻撃に加えます。",
              "対象のすぐ隣にいる防御側の味方は、防御に<strong>+1</strong>を加えます。",
              "攻撃ルート全体のコストがちょうど4なら、Vanguardは攻撃力がさらに<strong>+1</strong>されます。",
            ],
            tip: "<strong>例：</strong>高所のSentinel（3、+1）が味方Explorer（+1）の支援を受けると攻撃力は5です。防御力4の相手を倒せます。",
            caption: "地形と近くの支援が戦闘結果を変えます",
            hint: "場面を回転させて位置を確認しましょう",
          },
          {
            label: "06 · 盤外へ出て得点",
            title: "駒の強さが得点になる",
            paragraphs: [
              "駒を反対側の端から盤外へ出しましょう。駒が出るとゲームから離脱し、陣営はその駒の強さと同じ得点を獲得します。",
              "盤外へ出た駒は移動も戦闘もできません。Sentinelは盤外へ出るタイミングによって即勝利できるため注意しましょう。",
            ],
            scores: ["1ポイント", "2ポイント", "3ポイント"],
            tip: "<strong>戦略を選ぼう：</strong>Explorerは得点が少ないものの速く移動できます。Sentinelは貴重で、盤外へ出すのも難しい駒です。",
            caption: "端を越えた駒は取り除かれ、得点が加算されます",
            hint: "場面を回転させて出口を確認しましょう",
          },
          {
            label: "07 · ゲーム終了",
            title: "勝利条件は？",
            paragraphs: ["次のいずれかが起こるとゲームが終了します。"],
            bullets: [
              "<strong>最初に盤外へ出た駒がSentinel：</strong>その陣営が即座に勝利します。",
              "<strong>合計2個の駒が盤外へ出た：</strong>得点が高い陣営が勝ちます。同点の場合は引き分けです。",
              "<strong>盤上に駒が残っていない陣営がある：</strong>各陣営は残っている最強の駒の強さを得点に加え、その後に得点を比較します。",
              "<strong>200手に到達：</strong>得点を比較します。同点の場合は出口までの進み具合、それから駒の強さで判定します。",
            ],
            tip: "<strong>重要：</strong>Sentinelの即勝利は、本当に最初に盤外へ出た場合にのみ発生します。",
            caption: "Sentinelが最初に退出：即勝利",
            hint: "クリックしてドラッグすると回転します",
          },
          {
            label: "08 · あなたの番",
            title: "実際のプレイ手順",
            paragraphs: [
              "合法手がない場合、ゲームは自動的に手番をパスします。",
              "プレイヤーボタンでボット対戦と2人プレイを切り替えられます。新しい盤面ボタンは、異なる地形のマップを生成します。",
            ],
            bullets: [
              "<strong>自分の駒をクリック。</strong>移動できる場所がハイライトされます。",
              "<strong>ハイライトされた場所をクリック。</strong>移動、攻撃、盤外への退出がすぐに実行されます。",
              "<strong>高さと周囲の駒を確認。</strong>コストが高いルートも役立ちますが、戦闘結果を必ず確認しましょう。",
              "<strong>カメラを回転</strong>させるには、盤面上でマウスまたは指をドラッグします。",
            ],
            tip: "<strong>初めての対局のヒント：</strong>Explorerを動かし、マスに表示されたコストを確認してから、ほかの駒を少しずつ進めましょう。",
            caption: "駒を選び、ハイライトされた場所を選択します",
            hint: "クリックしてドラッグすると回転します",
          },
        ],
      },
      game: {
        light: "明るい側",
        dark: "暗い側",
        move: "手",
        movement: "移動力",
        strength: "強さ",
        pieceInfo: "{{piece}} · 移動力 {{movement}} · 強さ {{strength}}",
        playerTurn: "プレイヤー{{player}}（{{side}}）の番です",
        yourTurn: "あなたの番です",
        botThinking: "ボットが考えています…",
        draw: "引き分け",
        playerWins: "プレイヤー{{player}}の勝利",
        victory: "勝利！",
        defeat: "敗北",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported: "3D表示にはWebGL対応ブラウザーが必要です。",
        selectSkin: "Sentinelのスキンを選択：{{name}}",
      },
    },
    zh: {
      rules: {
        header: {
          language: "语言",
          kicker: "学习游戏玩法",
          title: "探索 Traversal",
          subtitle: "逐步学习规则。旋转每个 3D 示例，能帮助你更好地理解玩法。",
          close: "关闭教程",
          progress: "教程进度",
          track: "教程步骤。使用方向键或鼠标滚轮切换。",
          guide: "游戏指南",
          previous: "上一步",
          next: "下一步",
          skipStartup: "启动时不再显示",
          skinTitle: "选择棋子皮肤",
          closeSkin: "关闭皮肤选择",
          openRules: "打开游戏规则",
          openSkins: "打开皮肤",
          newBoard: "创建新棋盘",
          modeBot: "与电脑对战",
          modePlayers: "切换为双人模式",
          soundOn: "关闭声音",
          soundOff: "开启声音",
        },
        slides: [
          {
            label: "01 · 目标",
            title: "抵达对面的边缘",
            paragraphs: [
              "你将在一个 <strong>10 × 10 棋盘</strong>上游玩。部分格子更高，因此地形是 Traversal 中的重要因素。",
              "每方开局拥有<strong>六枚棋子</strong>。棋子从相对的两侧出发，目标是抵达对手一侧。单人模式中，你控制浅色棋子对抗电脑；双人模式中，每位玩家控制一方。",
            ],
            tip: "<strong>入门建议：</strong>先熟悉移动规则。规划好的路线可以获得分数，也能帮助你避开危险的战斗。",
            caption: "10 × 10 棋盘 · 双方 · 每方六枚棋子",
            hint: "点击并拖动即可旋转",
          },
          {
            label: "02 · 你的棋子",
            title: "三种棋子，三种玩法",
            paragraphs: [
              "移动力是普通路线可使用的点数。力量用于战斗，并决定棋子离开棋盘时获得的分数。",
            ],
            stats: [
              {
                line1: "移动力 5 · 力量 1",
                line2: "移动距离远，并拥有两种特殊移动。",
              },
              {
                line1: "移动力 4 · 力量 2",
                line2: "当攻击路线的总成本恰好为 4 点时，攻击力 +1。",
              },
              {
                line1: "移动力 3 · 力量 3",
                line2:
                  "力量最高。如果它是第一个离开棋盘的棋子，其一方立即获胜。",
              },
            ],
            tip: "<strong>关键取舍：</strong>棋子力量越高，普通移动能走的距离就越短。",
            caption: "Explorer · Vanguard · Sentinel",
            hint: "旋转棋子来观察它们",
          },
          {
            label: "03 · 移动",
            title: "地形会改变移动成本",
            paragraphs: [
              "普通移动只能走到相邻格，方向为<strong>水平或垂直</strong>。只要还有足够的移动点数，就可以连续走多个步骤。",
              "相同高度的格子之间移动花费<strong>1 点</strong>。高度相差一级花费<strong>2 点</strong>，相差两级花费<strong>3 点</strong>。每一步的成本需要相加。",
              "棋子会阻挡道路：普通路线不能穿过被占据的格子。如果游戏将敌方棋子的格子显示为可选目的地，就可以攻击它。",
            ],
            tip: "<strong>例子：</strong>一步跨越两个高度等级，仅这一步就要花费 3 点。",
            caption: "台阶和坡度可能消耗更多移动点数",
            hint: "旋转场景来比较高度",
          },
          {
            label: "04 · EXPLORER",
            title: "它有两种捷径",
            paragraphs: [
              "Explorer 可以特殊移动<strong>一格对角线</strong>，也可以沿水平或垂直方向<strong>直线跳过两格</strong>。",
              "跳跃时，起点与终点之间的格子必须<strong>为空</strong>。如果那里有棋子，跳跃就会被阻挡。这些特殊移动不使用普通的地形成本计算。",
            ],
            tip: "<strong>注意：</strong>Explorer 速度快，但力量只有 1。不要让它独自挑战更强的棋子。",
            caption: "黄色：对角移动 · 青色：可跳跃 · 红色：跳跃受阻",
            hint: "点击并拖动即可旋转",
          },
          {
            label: "05 · 战斗",
            title: "攻击前先观察周围",
            paragraphs: [
              "当敌方格子显示为可选目的地时，游戏会比较攻击力与防御力。地形和附近的棋子可能改变结果。",
              "如果攻击力大于或等于防御力，攻击就会成功，目标棋子将从棋盘上移除。",
            ],
            bullets: [
              "攻击方比目标高时获得 <strong>+1</strong>；低于目标时受到 <strong>−1</strong>。",
              "目标旁边的每个友方棋子都会把自己的<strong>力量</strong>加到攻击中。",
              "目标旁边的每个防守方友军都会为防御增加 <strong>+1</strong>。",
              "如果攻击路线总成本恰好为 4 点，Vanguard 还会获得<strong>额外 +1 攻击力</strong>。",
            ],
            tip: "<strong>例子：</strong>位于高处的 Sentinel（3，+1）在友方 Explorer（+1）支援下，攻击力为 5。防御力为 4 的目标会被击败。",
            caption: "地形和附近支援会改变战斗结果",
            hint: "旋转场景来查看各棋子的位置",
          },
          {
            label: "06 · 离场与得分",
            title: "棋子力量会转化为分数",
            paragraphs: [
              "让棋子从对面的边缘离开棋盘。棋子离场后不再参与游戏，其一方会获得等同于棋子力量的分数。",
              "离场棋子不能继续移动或战斗。请注意：Sentinel 离场的时机可能让它的一方立即获胜。",
            ],
            scores: ["1 分", "2 分", "3 分"],
            tip: "<strong>选择策略：</strong>Explorer 得分较少，但速度更快。Sentinel 很有价值，也更难成功离场。",
            caption: "棋子越过边缘后会被移除，并计入得分",
            hint: "旋转场景来查看出口",
          },
          {
            label: "07 · 游戏结束",
            title: "怎样才能获胜？",
            paragraphs: ["发生以下任意一种情况时，游戏就会结束："],
            bullets: [
              "<strong>第一个离场的棋子是 Sentinel：</strong>其一方立即获胜。",
              "<strong>总共有两枚棋子离场：</strong>得分较高的一方获胜。若得分相同，则为平局。",
              "<strong>一方在棋盘上已没有棋子：</strong>双方都将自己剩余棋子中力量最高的数值加到得分，再比较总分。",
              "<strong>游戏达到 200 回合：</strong>比较双方得分。若平分，则先比较棋子向出口推进的程度，再比较力量。",
            ],
            tip: "<strong>重要细节：</strong>Sentinel 的即时胜利只在它确实是第一个离场的棋子时生效。",
            caption: "Sentinel 第一个离场：立即获胜",
            hint: "点击并拖动即可旋转",
          },
          {
            label: "08 · 轮到你了",
            title: "一步一步开始游戏",
            paragraphs: [
              "如果你没有合法走法，游戏会自动跳过你的回合。",
              "玩家图标按钮可以在电脑对战与双人模式之间切换。新棋盘按钮会生成地形不同的新地图。",
            ],
            bullets: [
              "<strong>点击你的一枚棋子。</strong>可移动的目的地会高亮显示。",
              "<strong>点击高亮的目的地。</strong>移动、攻击或离场会立即执行。",
              "<strong>观察地形高度和附近棋子。</strong>高成本路线也可能有用，但一定要检查战斗结果。",
              "<strong>旋转视角</strong>时，在棋盘上拖动鼠标或手指即可。",
            ],
            tip: "<strong>第一局建议：</strong>先尝试移动 Explorer，观察格子显示的成本，再逐步推进其他棋子。",
            caption: "选择一枚棋子，然后点击高亮的目的地",
            hint: "点击并拖动即可旋转",
          },
        ],
      },
      game: {
        light: "浅色",
        dark: "深色",
        move: "回合",
        movement: "移动力",
        strength: "力量",
        pieceInfo: "{{piece}} · 移动力 {{movement}} · 力量 {{strength}}",
        playerTurn: "轮到玩家 {{player}}（{{side}}）",
        yourTurn: "轮到你了",
        botThinking: "电脑正在思考…",
        draw: "平局",
        playerWins: "玩家 {{player}} 获胜",
        victory: "胜利！",
        defeat: "失败",
        pieces: { e: "Explorer", v: "Vanguard", s: "Sentinel" },
        webglUnsupported: "3D 画面需要兼容 WebGL 的浏览器。",
        selectSkin: "选择 Sentinel 皮肤：{{name}}",
      },
    },
  };

  const SUPPORTED = Object.keys(LOCALES);
  const LANG_STORAGE_KEY = "traversal.language";
  const LANGUAGE_OPTIONS = [
    ["fr", "Français"],
    ["en", "English"],
    ["es", "Español"],
    ["de", "Deutsch"],
    ["it", "Italiano"],
    ["pt", "Português"],
    ["ja", "日本語"],
    ["zh", "简体中文"],
  ];

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return SUPPORTED.includes(saved) ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function detectBrowserLanguage() {
    const candidates = [];
    try {
      if (Array.isArray(navigator.languages))
        candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
    } catch (_) {
      /* Use English if browser language preferences are unavailable. */
    }

    for (const candidate of candidates) {
      if (typeof candidate !== "string") continue;
      const baseLanguage = candidate
        .trim()
        .toLowerCase()
        .replace(/_/g, "-")
        .split("-")[0];
      if (SUPPORTED.includes(baseLanguage)) return baseLanguage;
    }
    return "en";
  }

  // Source strings are authored in English. On a first visit, display the first supported
  // browser/OS language; a manually selected language remains the saved preference.
  let activeLanguage = readSavedLanguage() || detectBrowserLanguage();

  function getLocalValue(key, lang = activeLanguage) {
    return (
      key
        .split(".")
        .reduce(
          (value, part) => (value == null ? undefined : value[part]),
          LOCALES[lang],
        ) ??
      key
        .split(".")
        .reduce(
          (value, part) => (value == null ? undefined : value[part]),
          LOCALES.en,
        ) ??
      key
    );
  }

  if (window.i18next && typeof window.i18next.init === "function") {
    const resources = Object.fromEntries(
      Object.entries(LOCALES).map(([lng, translation]) => [
        lng,
        { translation },
      ]),
    );
    window.i18next
      .init({
        lng: activeLanguage,
        fallbackLng: "en",
        resources,
        initImmediate: false,
        returnNull: false,
        interpolation: { escapeValue: false },
      })
      .catch((error) =>
        console.warn("Traversal translations could not initialize:", error),
      );
  }

  function t(key, options) {
    if (window.i18next && window.i18next.isInitialized) {
      const value = window.i18next.t(key, {
        ...(options || {}),
        lng: activeLanguage,
      });
      if (value !== key) return value;
    }
    let value = getLocalValue(key);
    if (typeof value !== "string") return key;
    if (options && typeof options === "object") {
      value = value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(options, name)
          ? String(options[name])
          : match,
      );
    }
    return value;
  }

  window.traversalTranslate = t;
  window.traversalLanguages = LANGUAGE_OPTIONS.map(([code, label]) => ({
    code,
    label,
  }));
  window.traversalGetLanguage = () => activeLanguage;

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element && typeof text === "string") element.innerHTML = text;
  }

  function applyTranslations() {
    const language = activeLanguage;
    const rules = getLocalValue("rules", language);
    const header = rules.header;
    const root = document.documentElement;

    root.lang = language;
    document
      .querySelector("#rules-modal .rules-container")
      ?.setAttribute("lang", language);
    document.querySelector("#rules-modal")?.setAttribute("dir", "ltr");

    setText(".rules-kicker", header.kicker);
    setText("#rules-modal-title", header.title);
    setText(".rules-heading-copy > p", header.subtitle);
    setText(".rules-progress-caption", header.guide);
    setText("#rules-skip-startup + span", header.skipStartup);
    setText("#rules-language-label", header.language);
    setText("#skin-modal-title", header.skinTitle);

    document
      .querySelector("#close-rules-modal-button")
      ?.setAttribute("aria-label", header.close);
    document
      .querySelector(".rules-progress-track")
      ?.setAttribute("aria-label", header.progress);
    document
      .querySelector("#rules-track")
      ?.setAttribute("aria-label", header.track);
    document
      .querySelector("#rules-prev-button")
      ?.setAttribute("aria-label", header.previous);
    document
      .querySelector("#rules-next-button")
      ?.setAttribute("aria-label", header.next);
    document
      .querySelector("#close-skin-modal-button")
      ?.setAttribute("aria-label", header.closeSkin);
    document
      .querySelector("#rules-modal-button")
      ?.setAttribute("aria-label", header.openRules);
    document
      .querySelector("#rules-modal-button")
      ?.setAttribute("title", header.openRules);
    document
      .querySelector("#skin-modal-button")
      ?.setAttribute("aria-label", header.openSkins);
    document
      .querySelector("#skin-modal-button")
      ?.setAttribute("title", header.openSkins);
    document
      .querySelector("#new-board-button")
      ?.setAttribute("aria-label", header.newBoard);
    document
      .querySelector("#new-board-button")
      ?.setAttribute("title", header.newBoard);
    document
      .querySelector("#game-mode-button")
      ?.setAttribute("aria-label", header.modePlayers);
    document
      .querySelector("#game-mode-button")
      ?.setAttribute("title", header.modePlayers);
    document
      .querySelector("#sound-toggle-button")
      ?.setAttribute("aria-label", header.soundOn);
    document
      .querySelector("#sound-toggle-button")
      ?.setAttribute("title", header.soundOn);

    rules.slides.forEach((content, index) => {
      const slide = document.querySelector(
        `.rules-slide[data-slide="${index}"]`,
      );
      if (!slide) return;

      setText(
        `.rules-slide[data-slide="${index}"] .rules-section-label`,
        content.label,
      );
      setText(
        `.rules-slide[data-slide="${index}"] .rules-copy h3`,
        content.title,
      );

      const paragraphNodes = [...slide.querySelectorAll(".rules-copy > p")];
      (content.paragraphs || []).forEach((paragraph, paragraphIndex) => {
        if (paragraphNodes[paragraphIndex])
          paragraphNodes[paragraphIndex].innerHTML = paragraph;
      });

      const tip = slide.querySelector(".rules-copy > .rules-tip");
      if (tip && content.tip) tip.innerHTML = content.tip;

      const bulletNodes = [...slide.querySelectorAll(".rules-bullet-list li")];
      (content.bullets || []).forEach((bullet, bulletIndex) => {
        if (bulletNodes[bulletIndex])
          bulletNodes[bulletIndex].innerHTML = bullet;
      });

      const statRows = [...slide.querySelectorAll(".rules-stat-list > div")];
      (content.stats || []).forEach((stat, statIndex) => {
        const row = statRows[statIndex];
        const smalls = row ? row.querySelectorAll("small") : [];
        if (smalls[0]) smalls[0].textContent = stat.line1;
        if (smalls[1]) smalls[1].textContent = stat.line2;
      });

      const scores = [...slide.querySelectorAll(".rules-score-grid small")];
      (content.scores || []).forEach((score, scoreIndex) => {
        if (scores[scoreIndex]) scores[scoreIndex].textContent = score;
      });

      const caption = slide.querySelector(".rules-visual-caption");
      const hint = slide.querySelector(".rules-drag-hint");
      if (caption) caption.textContent = content.caption || "";
      if (hint) hint.textContent = content.hint || "";
    });

    const languageSelect = document.getElementById("rules-language-select");
    if (languageSelect && languageSelect.value !== language)
      languageSelect.value = language;

    document.title = "Traversal";
    window.dispatchEvent(
      new CustomEvent("traversal:language-changed", { detail: { language } }),
    );
  }

  function setLanguage(language) {
    if (!SUPPORTED.includes(language) || language === activeLanguage) return;

    activeLanguage = language;

    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch (_) {
      /* private browsing can disable storage */
    }

    if (window.i18next && window.i18next.isInitialized) {
      window.i18next
        .changeLanguage(language)
        .catch((error) => console.warn("Could not change language:", error));
    }

    applyTranslations();
  }

  function populateLanguageSelect() {
    const select = document.getElementById("rules-language-select");
    if (!select) return;

    select.replaceChildren();

    for (const [code, label] of LANGUAGE_OPTIONS) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = label;
      select.appendChild(option);
    }

    select.value = activeLanguage;
    select.addEventListener("change", () => setLanguage(select.value));
  }

  populateLanguageSelect();
  applyTranslations();

  window.traversalApplyTranslations = applyTranslations;
  window.traversalSetLanguage = setLanguage;
})();
