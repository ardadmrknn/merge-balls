Project: "Merge Guys" Clone (Suika Game Style)

1. Project Overview

This is a mobile-first, physics-based merge game. Players drop colorful balls of different sizes into a container. When two balls of the same level collide, they merge into a single ball of the next level. The goal is to reach the highest score without overflowing the container.

2. Technical Stack

Framework: Vanilla HTML5, CSS3, JavaScript.

Physics Engine: Matter.js (v0.19.0 or latest).

Design: Mobile-responsive, portrait orientation (9:16 aspect ratio).

Assets: SVG-based or Emoji placeholders (to be replaced with ComfyUI generated PNGs).

3. Core Mechanics (The "Merge" Logic)

Physics Setup:

Use Matter.Engine and Matter.Render.

Create a container with 3 static walls (Left, Right, Bottom).

Gravity should be set to default (1.0).

Spawning & Controls:

Click/Touch Start: Show a ghost preview of the current ball at the top.

Click/Touch Move: Follow the X-coordinate of the touch/mouse.

Click/Touch End: Drop the ball from the current X-position.

Cooldown: Implement a 500ms delay between drops.

Merge System:

Every ball must have a label property (e.g., "level1", "level2"...).

Use Matter.Events.on(engine, 'collisionStart', ...) to detect collisions.

Merge Rule: If bodyA.label === bodyB.label:

Calculate the midpoint between bodyA and bodyB.

Remove both bodies from the world.

Spawn a new body at the midpoint with level + 1.

Mentor Tip: Add a small "pop" effect (slight scale increase) when a new ball spawns to give it "juice".

4. Game Data & Levels

Define an array of levels:

White (Tiny): Radius 15, Score 2

Blue (Small): Radius 25, Score 4

Green (Medium): Radius 40, Score 8

Orange (Large): Radius 60, Score 16

Purple (Extra Large): Radius 85, Score 32

... (Continue up to 10 levels)

5. UI/UX Requirements

Header: Score display, High Score (LocalStorage).

GameOver: If a ball stays above the "Dead Line" for more than 3 seconds, trigger Game Over.

Responsiveness: Canvas should scale to fit the viewport width. Use window.innerWidth for setup.

6. Instructions for AI Agent

Step 1: Initialize a basic HTML file with a full-screen Canvas and Matter.js library.

Step 2: Create the "Bucket" (walls) and the game loop.

Step 3: Implement the click-to-drop mechanism.

Step 4: Code the collision detection logic. Ensure you handle the "double merge" bug (where 3 balls merging at once crashes the engine).

Step 5: Add a scoring system and a Game Over line.

Step 6: Use CSS to make the background look like the "Grid Paper" style in the reference image.

7. Future Enhancements (Post-MVP)

Integration of ComfyUI-generated character textures.

Particle effects on merge.

Sound effects for collisions and merging.