# Simulation de Flocking dans un Monde Marin 🌊

Bienvenue dans cette simulation interactive de *flocking*! Ce jeu vous plonge dans un monde marin peuplé de poissons, de requins prédateurs, et d'obstacles. Découvrez comment les bancs de poissons interagissent et observez les dynamiques fascinantes de leurs comportements naturels.

---

## 🐟 Concept du Jeu

Ce jeu s'inspire des comportements collectifs des animaux, tels que les bancs de poissons et les vols d'oiseaux. Les poissons se déplacent en groupe, en suivant trois principes simples :  
- **Cohésion** : Les poissons restent proches du groupe.  
- **Alignement** : Ils synchronisent leurs directions.  
- **Séparation** : Ils évitent de se heurter.  

Des requins prédateurs introduisent un élément de défi en poursuivant les poissons, tandis que vous pouvez ajouter des obstacles pour pimenter la simulation. Vous pouvez également changer le comportement des requins en les regroupant en formations pack ou serpent.  

---

## 🚀 Comment Jouer


### Commandes
- **Souris** :  
  - *Clic & Drag* : Ajoutez des poissons à l'emplacement de la souris.  
  - Les requins suivront le curseur si vous activez certains modes.  

- **Clavier** :  
  - `R` : Ajoute un nouveau requin.  
  - `O` : Place un obstacle à la position de la souris.  
  - `D` : Active/Désactive le mode debug (affiche des vecteurs et rayons).  
  - `P` : Les requins se regroupent autour du curseur en formation pack.  
  - `S` : Les requins se suivent en formation serpent.  

### Interface
- Ajustez les comportements des poissons à l’aide des curseurs sur l’écran.  
  Par exemple, vous pouvez régler le poids des forces de cohésion, d’alignement, ou de séparation pour modifier leur manière de se déplacer.  

---

## 🛠️ Explications du Code

Le projet repose sur les concepts suivants :  
1. **Les Boids** : Chaque poisson est un objet appelé "boid" avec des propriétés comme la position, la vitesse, et des règles comportementales.  
2. **Requins et Obstacles** : Les requins suivent des cibles (autres poissons ou le curseur) et évitent les obstacles que vous placez sur la scène.  
3. **Interface Utilisateur (UI)** : Des curseurs permettent de modifier les paramètres en temps réel pour expérimenter avec le comportement des poissons.  
4. **Mode Debug** : Vous pouvez afficher des rayons de perception et des vecteurs pour mieux comprendre comment les forces influencent chaque entité.  

---

## 🎮 Expérimentez!

Le jeu est un bac à sable éducatif où vous pouvez explorer les comportements collectifs et les interactions dynamiques dans un environnement marin. Ajoutez des poissons, ajustez les paramètres, introduisez des requins et des obstacles, et observez les résultats!

Amusez-vous bien et plongez dans le monde fascinant du *flocking*! 🐠🦈
