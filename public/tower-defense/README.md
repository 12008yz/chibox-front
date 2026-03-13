Tower Defense assets
=====================

Сюда нужно положить картинки для игры в башни.

Рекомендуемая структура:

- tiles/ — тайлы карты
  - grass.png — обычная земля/фон
  - path.png — дорожка, по которой идут враги
- towers/ — спрайты башен
  - tower_basic.png — базовая башня
- enemies/ — спрайты врагов
  - enemy_basic.png — базовый враг

После этого в коде фронтенда можно обращаться к ним как:

- /tower-defense/tiles/grass.png
- /tower-defense/tiles/path.png
- /tower-defense/towers/tower_basic.png
- /tower-defense/enemies/enemy_basic.png

Ты можешь заменить имена файлов на свои, но тогда не забудь поправить пути в компоненте TowerDefenseGame.tsx.
