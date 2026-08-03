# Gameplay Scene

Create an empty Cocos scene named `Gameplay` and attach `GameplayBootstrap` to a root node.

`GameplayBootstrap` creates the first playable runtime hierarchy:

- `BoardRoot`
- `Block`
- `Main Camera`
- `Key Light`
- `Canvas`
- touch input and gameplay controller components

This keeps the first implementation reviewable in source control while still allowing the scene to be replaced by authored Cocos prefabs and materials later.
