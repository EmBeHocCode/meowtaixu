# Environment state handoff

## Added modules

- `src/features/environment/EnvironmentProvider.tsx`: global React provider and `useEnvironment()` hook.
- `src/features/environment/environment-model.ts`: pure presets and exponential interpolation.
- `src/features/environment/types.ts`: weather, time, cycle and snapshot types.
- `src/features/environment/EnvironmentDebugControls.tsx`: development-only controls activated by `?envDebug=1`.
- `src/features/environment/index.ts`: public exports.

No existing application, scene, test or deployment file was changed in this handoff.

## Integration

Mount the provider once in `AppProviders`. Keep automatic cycling off until art direction and scene consumers are connected:

```tsx
import { EnvironmentDebugControls, EnvironmentProvider } from '../../features/environment';

<EnvironmentProvider initialWeather="calm" initialTime="night" transitionMs={5000}>
  {children}
  {import.meta.env.DEV && <EnvironmentDebugControls />}
</EnvironmentProvider>
```

The debug overlay is doubly guarded: the caller should use `import.meta.env.DEV`, and the component itself renders only in development with `?envDebug=1`. It is therefore absent from production UI.

## Journey awareness and render budgets

After the active chapter changes, call `setActiveSection(chapters[active].id)` from a small bridge component inside the provider. Alternatively pass a controlled `activeSection` prop to `EnvironmentProvider`.

Consumers should call `getSectionActivity(sectionId)` and apply the returned budget:

- `active`: full animation allowed according to `quality`.
- `adjacent`: prepare assets and retain low-cost cloud/mist motion; reduce entity and rain density.
- `paused`: stop local RAF/useFrame work and hide expensive effects.

The provider also pauses interpolation, weather cycling and thunder scheduling while the document is hidden. `setPaused(true)` is available to the debug UI. `quality` is `full`, `reduced` on mobile/coarse pointers, or `static` under reduced motion. Reduced-motion changes snap to the new coherent environment target rather than continuously interpolating.

Do not place provider state writes inside Three.js `useFrame`. Read the smoothly interpolated `values` snapshot and map its normalized values to scene-specific limits:

- `rain`, `wind`, `windDirection`, `cloud`, `fog`, `storm`, `lightning`: weather targets from 0 to 1.
- `daylight`, `moonlight`, `warmth`: lighting balance from 0 to 1.

Use `thunderPulse`, not `values.lightning`, as direct sky illumination. `values.lightning` describes the state's thunder potential; `thunderPulse` produces a short, infrequent, non-strobing envelope only during heavy rain or storm. It is disabled under reduced motion and while paused/hidden.

Weather presets are coherent targets: heavier rain also increases wind, cloud and fog; lightning remains nearly absent until heavy/storm. The default transition is five seconds and uses exponential damping to avoid abrupt visual changes.

## Movement paths

`movement-paths.ts` contains normalized cubic Bézier configs. Coordinates may be mapped to viewport, world or camera space by the scene consumer.

```ts
const path = environmentMovementPaths.birdsNear;
const run = createMovementRun(path);
const point = sampleMovementPath(path, progress, run);
const facing = movementFacing(path, progress); // 1 right, -1 left
const opacity = movementOpacity(path, progress);
```

Create a new `MovementRun` only after the previous travel and `respawnDelayMs` complete. Its randomized duration, scale, phase and vertical offset keep entities from sharing an identical line. Frame animation remains the scene's responsibility; advance frames using elapsed time, never CSS translation duration.

## Debug preview

Mount `EnvironmentDebugControls` only in development. `?envDebug=1` enables weather/time selects, pause/resume, path overlay and state telemetry. A scene may pass up to date entity telemetry:

```tsx
<EnvironmentDebugControls entities={debugEntities} />
```

Each `EnvironmentDebugEntity` supplies normalized coordinates, direction, speed, frame index and depth. Green path dots are spawn points; red dots are endpoints; pale dots are current entities. Avoid updating React telemetry every render frame: 5–10 updates per second is sufficient for debug inspection.

## Optional cycle

Set `autoCycle` only when a global atmospheric cycle is approved. Supply `cycle` for authored pacing; each step can override `durationMs`, otherwise `cycleDurationMs` is used. The bundled cycle moves slowly through calm → drizzle → rain → heavy → storm and back toward dusk.

Visual consumers still own their rendering policy: under `quality === 'static'`, render a static snapshot, suppress continuous rain/wind/entity motion and retain the same readable HTML. The provider supplies coherent state and a budget signal; it does not force WebGL or create section-specific visuals.

## Main integration checklist

1. Mount exactly one provider above the complete horizontal journey.
2. Bridge the journey's active chapter into `setActiveSection` or the controlled `activeSection` prop.
3. Map all weather consumers from the same `values`; never create a second random weather state inside Hero.
4. Use `getSectionActivity` and `quality` to gate local RAF/useFrame, rain density, distant entities and shaders.
5. Validate `?envDebug=1` for both path directions, pause/resume, all five weather states, all three time states, mobile and reduced motion.
