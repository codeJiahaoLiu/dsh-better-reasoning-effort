window.__ModuleLoader__.load({
	id: "dsh-better-reasoning-effort",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const __RLS_CSS__ = "/*\n * dsh-better-reasoning-effort — a compact violet slider for the DSH composer.\n *\n * Layout (24px tall):\n *\n *   .rls-slider\n *     .rls-current                    current level, capitalized\n *     .rls-track[role=slider]         220px × 22px, grey-black rail\n *       .rls-fill > .rls-sheen        purple fill up to the current stop\n *       .rls-aura                     soft glow around the thumb\n *       .rls-meteor × 6               moving white meteor trails\n *       .rls-thumb                    rounded-square pearl knob\n *\n * The unfilled part of the rail stays grey-black. The fill gradient is static\n * and scaled to the fill width; the sheen, meteors, and glow loop seamlessly,\n * and their durations shorten as the level rises.\n *\n * The native model-menu effort entry is hidden from the menu's first paint so\n * the popup measures and animates at its final height. Model options are not\n * touched.\n */\n\nbody[data-rls-effort-slider] [class*=\"triggerEffort\"] {\n  display: none;\n}\n\n/*\n * Hide the root menu's second cell (Model, Effort) synchronously. The model\n * menu is the only MenuSurface whose cells carry `cellLabel`; scoping this\n * rule prevents the one-frame height jump caused by hiding the cell after the\n * popup has already measured itself.\n */\nbody[data-rls-effort-slider] [role=\"menu\"]:has(> button[role=\"menuitem\"] [class*=\"cellLabel\"]) > button[role=\"menuitem\"] + button[role=\"menuitem\"] {\n  display: none !important;\n}\n\n.rls-slider {\n  --rls-track-h: 22px;\n  --rls-thumb-size: 18px;\n  --rls-inset: 11px;\n  display: flex;\n  flex: 0 1 auto;\n  align-items: center;\n  gap: 10px;\n  width: max-content;\n  max-width: 100%;\n  min-width: 0;\n  height: 24px;\n  color: var(--dsw-alias-label-secondary, #4c5360);\n  font-size: 12px;\n  line-height: 16px;\n  user-select: none;\n}\n\n.rls-current {\n  flex: 0 0 auto;\n  min-width: 54px;\n  max-width: 68px;\n  overflow: hidden;\n  color: #7c3aed;\n  font-size: 11.5px;\n  font-weight: 650;\n  line-height: 14px;\n  letter-spacing: 0.01em;\n  text-align: right;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  text-shadow: 0 0 8px rgba(168, 85, 247, 0.35);\n  transition: color 160ms ease, text-shadow 160ms ease;\n}\n\nbody[data-ds-dark-theme] .rls-current {\n  color: #e9d5ff;\n  text-shadow: 0 0 9px rgba(217, 70, 239, 0.45);\n}\n\n.rls-track {\n  --rls-thumb-left: calc(var(--rls-inset) + (100% - 2 * var(--rls-inset)) * var(--rls-pos, 0));\n  --rls-sheen-duration: calc(4.8s - 2.8s * var(--rls-pos, 0));\n  --rls-meteor-duration: calc(5.4s - 3.6s * var(--rls-pos, 0));\n  --rls-aura-duration: calc(4.2s - 2s * var(--rls-pos, 0));\n  --rls-thumb-duration: calc(3.2s - 1.2s * var(--rls-pos, 0));\n  position: relative;\n  flex: 0 0 220px;\n  width: 220px;\n  height: var(--rls-track-h);\n  overflow: hidden;\n  border: 1px solid transparent;\n  border-radius: calc(var(--rls-track-h) / 2);\n  corner-shape: round;\n  background: linear-gradient(90deg, #202028 0%, #292932 58%, #32323c 100%);\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.06),\n    inset 0 -8px 14px rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n  outline: none;\n  touch-action: none;\n  transition: border-color 160ms ease, box-shadow 160ms ease;\n}\n\n.rls-slider:hover .rls-track,\n.rls-slider[data-dragging] .rls-track {\n  border-color: rgba(168, 85, 247, 0.45);\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.08),\n    inset 0 -8px 14px rgba(0, 0, 0, 0.45),\n    0 0 16px rgba(168, 85, 247, 0.28);\n}\n\n.rls-track:focus-visible {\n  border-color: rgba(168, 85, 247, 0.75);\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.08),\n    inset 0 -8px 14px rgba(0, 0, 0, 0.45),\n    0 0 0 2px rgba(139, 92, 246, 0.6),\n    0 0 18px rgba(168, 85, 247, 0.35);\n}\n\n.rls-fill {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: min(100%, calc(var(--rls-inset) + (100% - 2 * var(--rls-inset)) * var(--rls-pos, 0) + var(--rls-thumb-size) / 2));\n  overflow: hidden;\n  border-radius: inherit;\n  background-image: linear-gradient(90deg in oklab, #8b5cf6 0%, #e9d5ff 100%);\n  background-size: 100% 100%;\n  background-repeat: no-repeat;\n  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.08);\n  pointer-events: none;\n}\n\n.rls-fill::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 42%, rgba(0, 0, 0, 0.12));\n  pointer-events: none;\n}\n\n.rls-sheen {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: -70%;\n  width: 70%;\n  background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.52), transparent);\n  animation: rls-sheen var(--rls-sheen-duration) linear infinite;\n  pointer-events: none;\n}\n\n.rls-aura {\n  position: absolute;\n  top: 50%;\n  left: var(--rls-thumb-left);\n  width: 56px;\n  height: 56px;\n  border-radius: 16px;\n  background: radial-gradient(circle, rgba(216, 180, 254, 0.5) 0%, rgba(168, 85, 247, 0.28) 36%, transparent 70%);\n  filter: blur(6px);\n  mix-blend-mode: screen;\n  transform: translate(-50%, -50%);\n  animation: rls-aura-pulse var(--rls-aura-duration) ease-in-out infinite;\n  pointer-events: none;\n}\n\n.rls-meteor {\n  position: absolute;\n  left: -20%;\n  height: 1.5px;\n  border-radius: 999px;\n  background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.92));\n  box-shadow: 0 0 6px rgba(255, 255, 255, 0.55);\n  opacity: 0;\n  animation: rls-meteor var(--rls-meteor-duration) linear infinite;\n  pointer-events: none;\n}\n\n.rls-meteor::after {\n  content: \"\";\n  position: absolute;\n  top: 50%;\n  right: -1px;\n  width: 2px;\n  height: 2px;\n  border-radius: 50%;\n  background: #ffffff;\n  box-shadow: 0 0 5px #ffffff;\n  transform: translateY(-50%);\n}\n\n.rls-thumb {\n  position: absolute;\n  top: 50%;\n  left: var(--rls-thumb-left);\n  width: var(--rls-thumb-size);\n  height: var(--rls-thumb-size);\n  border: 1.5px solid rgba(255, 255, 255, 0.9);\n  border-radius: 6px;\n  corner-shape: round;\n  background:\n    radial-gradient(circle at 32% 26%, #ffffff 0 12%, #f8f3ea 42%, #eadcff 72%, #c4b5fd 100%);\n  box-shadow:\n    0 0 0 2px rgba(255, 255, 255, 0.1),\n    0 0 14px rgba(168, 85, 247, 0.65),\n    0 3px 8px rgba(0, 0, 0, 0.38);\n  transform: translate(-50%, -50%);\n  transition: left 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms ease;\n  pointer-events: none;\n}\n\n.rls-thumb::before {\n  content: \"\";\n  position: absolute;\n  inset: 2.5px;\n  border-radius: 4px;\n  background-image:\n    repeating-linear-gradient(118deg, rgba(120, 80, 160, 0.07) 0 1px, transparent 1px 4px),\n    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.95), transparent 48%);\n  opacity: 0.8;\n}\n\n.rls-thumb::after {\n  content: \"\";\n  position: absolute;\n  inset: -6px;\n  z-index: -1;\n  border-radius: 9px;\n  background: radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent 68%);\n  filter: blur(4px);\n  animation: rls-thumb-glow var(--rls-thumb-duration) ease-in-out infinite;\n}\n\n.rls-slider[data-pending] .rls-thumb {\n  animation: rls-pending 1.4s ease-in-out infinite;\n}\n\n.rls-slider[data-dragging] .rls-thumb {\n  transform: translate(-50%, -50%) scale(1.1);\n  transition: transform 120ms ease;\n}\n\n.rls-slider[data-error] .rls-track {\n  border-color: rgba(239, 68, 68, 0.7);\n  box-shadow:\n    inset 0 1px 1px rgba(255, 255, 255, 0.06),\n    inset 0 -8px 14px rgba(0, 0, 0, 0.45),\n    0 0 14px rgba(239, 68, 68, 0.28);\n}\n\n.rls-slider[data-error] .rls-current {\n  color: #ef4444;\n  text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);\n}\n\nbody[data-ds-dark-theme] .rls-slider {\n  color: #c0c6d2;\n}\n\nbody[data-ds-dark-theme] .rls-track {\n  border-color: transparent;\n  background: linear-gradient(90deg, #1a1a20 0%, #22222a 58%, #2b2b34 100%);\n}\n\nbody[data-ds-dark-theme] .rls-slider[data-error] .rls-current {\n  color: #fca5a5;\n}\n\n@keyframes rls-sheen {\n  from {\n    transform: translateX(0);\n  }\n  to {\n    transform: translateX(300%);\n  }\n}\n\n@keyframes rls-meteor {\n  0% {\n    left: -20%;\n    opacity: 0;\n  }\n  8% {\n    opacity: 1;\n  }\n  86% {\n    opacity: 1;\n  }\n  100% {\n    left: 120%;\n    opacity: 0;\n  }\n}\n\n@keyframes rls-aura-pulse {\n  0%,\n  100% {\n    opacity: 0.55;\n    transform: translate(-50%, -50%) scale(0.9);\n  }\n  50% {\n    opacity: 1;\n    transform: translate(-50%, -50%) scale(1.12);\n  }\n}\n\n@keyframes rls-thumb-glow {\n  0%,\n  100% {\n    opacity: 0.6;\n    transform: scale(0.92);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.1);\n  }\n}\n\n@keyframes rls-pending {\n  0%,\n  100% {\n    box-shadow:\n      0 0 0 2px rgba(255, 255, 255, 0.1),\n      0 0 10px rgba(217, 70, 239, 0.6),\n      0 3px 8px rgba(0, 0, 0, 0.38);\n  }\n  50% {\n    box-shadow:\n      0 0 0 4px rgba(255, 255, 255, 0.16),\n      0 0 20px rgba(217, 70, 239, 0.9),\n      0 3px 8px rgba(0, 0, 0, 0.38);\n  }\n}\n\n@container (max-width: 700px) {\n  .rls-track {\n    flex-basis: 180px;\n    width: 180px;\n  }\n\n  .rls-current {\n    min-width: 48px;\n    font-size: 11.5px;\n  }\n}\n\n@container (max-width: 560px) {\n  .rls-slider {\n    gap: 8px;\n  }\n\n  .rls-track {\n    flex-basis: 150px;\n    width: 150px;\n  }\n\n  .rls-current {\n    min-width: 44px;\n    font-size: 11px;\n  }\n}\n\n@container (max-width: 460px) {\n  .rls-track {\n    flex-basis: 120px;\n    width: 120px;\n  }\n\n  .rls-current {\n    min-width: 40px;\n    font-size: 10.5px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .rls-sheen,\n  .rls-meteor,\n  .rls-aura,\n  .rls-thumb::after,\n  .rls-slider[data-pending] .rls-thumb {\n    animation: none !important;\n  }\n\n  .rls-thumb {\n    transition: none !important;\n  }\n}\n\n@media (forced-colors: active) {\n  .rls-track {\n    border: 1px solid CanvasText;\n    background: Canvas;\n    box-shadow: none;\n  }\n\n  .rls-fill {\n    background: Highlight;\n    box-shadow: none;\n  }\n\n  .rls-sheen,\n  .rls-meteor,\n  .rls-aura {\n    display: none;\n  }\n\n  .rls-thumb {\n    border-color: CanvasText;\n    background: CanvasText;\n    box-shadow: none;\n  }\n\n  .rls-thumb::before,\n  .rls-thumb::after {\n    display: none;\n  }\n\n  .rls-current {\n    color: CanvasText;\n    text-shadow: none;\n  }\n}\n";
/**
 * dsh-better-reasoning-effort — browser half.
 *
 * The Web GUI's model picker normally chooses reasoning effort from a menu.
 * This plugin replaces that interaction with a compact, always-visible slider
 * in the composer (`conversation.input.right`):
 *
 *   Effort  ●━━━━━━━━  High
 *
 * The slider reads the per-session model directory and submits through the
 * same `session.selectModel` path as the native picker, so it stays in sync
 * with the model seat, `/model`, and selections made in another tab.
 *
 * The native effort menu entry is hidden while the slider is usable; model
 * options stay untouched. If the model advertises no reasoning levels, the
 * plugin renders nothing and the native picker remains available.
 *
 * The stylesheet owns the violet aurora treatment; this module owns state,
 * pointer/keyboard interaction, accessibility, and cleanup.
 */

const PLUGIN_ID = 'dsh-better-reasoning-effort'
const STYLE_TAG_ID = `${PLUGIN_ID}/reasoning-spectrum.css`
const NS = 'better-reasoning-effort'

const ZH = {
  sliderAria: '推理强度滑块',
  defaultStop: '默认',
  error: '无法切换推理等级',
}

const EN = {
  sliderAria: 'Reasoning effort slider',
  defaultStop: 'Default',
  error: 'Could not change reasoning effort',
}

/** Small meteor streaks that travel across the track. */
const METEORS = [
  { top: '20%', length: 16, delay: -0.8 },
  { top: '38%', length: 22, delay: -3.5 },
  { top: '54%', length: 26, delay: -2.6 },
  { top: '70%', length: 14, delay: -1.6 },
  { top: '46%', length: 19, delay: -4.4 },
  { top: '64%', length: 17, delay: -5.2 },
]

/**
 * Build the discrete stops shown by the slider.
 *
 * When the adapter leaves `defaultEffort` undefined, the native picker adds a
 * provider-default row that omits `reasoningEffort`. Mirror that row so the
 * slider can represent "no explicit effort" without inventing a level.
 *
 * @param {{ efforts?: Array<{ id: string, name?: string }>, defaultEffort?: string } | undefined} reasoning
 *   Reasoning metadata for the selected model.
 * @param {string} defaultLabel - Localized provider-default label.
 * @returns {Array<{ id: string | undefined, name: string }>} Ordered stops.
 */
function buildStops(reasoning, defaultLabel) {
  if (reasoning === undefined || reasoning === null) return []
  const efforts = Array.isArray(reasoning.efforts) ? reasoning.efforts : []
  const stops = []
  if (reasoning.defaultEffort === undefined) stops.push({ id: undefined, name: defaultLabel })
  for (const effort of efforts) stops.push({ id: effort.id, name: effort.name ?? effort.id })
  return stops
}

/**
 * Find the stop matching an adapter effort id.
 * @param {Array<{ id: string | undefined }>} stops - Slider stops.
 * @param {string | undefined} effort - Current or default effort id.
 * @returns {number} Matching index, or 0 when the id is absent.
 */
function stopIndexOf(stops, effort) {
  const index = stops.findIndex((stop) => stop.id === effort)
  return index < 0 ? 0 : index
}

/**
 * Position of one stop on the 0..1 track.
 * @param {number} index - Stop index.
 * @param {number} count - Number of stops.
 * @returns {number} Fraction in [0, 1]; a single stop sits at the center.
 */
function positionOf(index, count) {
  if (!Number.isFinite(index) || !Number.isFinite(count) || count <= 1) return 0.5
  return Math.min(1, Math.max(0, index / (count - 1)))
}

/**
 * Capitalize the first letter of a level name without changing the rest.
 * @param {unknown} value - Adapter effort name.
 * @returns {string} Display text such as "High" or "Extra high".
 */
function capitalizeFirst(value) {
  const text = String(value ?? '')
  return text === '' ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Build the plugin with its stylesheet and the host-provided React runtime.
 * @param {string} cssText - Stylesheet contents for the plugin lifetime.
 * @param {object} React - Host React module (hooks and createElement).
 * @returns {{ inject: string[], apply: (ctx: object) => void }} Cordis client plugin.
 */
function createPlugin(cssText, React) {
  const {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
  } = React

  let activeSliders = 0

  /** Mark the page so CSS can hide the native effort controls. */
  function acquireSliderMarker() {
    activeSliders += 1
    if (activeSliders === 1 && typeof document !== 'undefined') {
      document.body.dataset.rlsEffortSlider = ''
    }
    let released = false
    return () => {
      if (released) return
      released = true
      activeSliders = Math.max(0, activeSliders - 1)
      if (activeSliders === 0 && typeof document !== 'undefined') {
        delete document.body.dataset.rlsEffortSlider
      }
    }
  }

  const EMPTY_STATE = {
    current: null,
    groups: [],
    failures: [],
    status: 'idle',
    pending: null,
    error: null,
  }

  /**
   * Compact reasoning-effort slider rendered into the composer's right slot.
   * @param {object} props - Injected directory face plus the locale seat.
   * @returns {object | null} Slider element, or null when this model has no choice.
   */
  function EffortSlider({ available, store, load, select, t }) {
    const subscribe = useCallback(
      (notify) => (store === undefined ? () => {} : store.subscribe(notify)),
      [store],
    )
    const getSnapshot = useCallback(
      () => (store === undefined ? EMPTY_STATE : store.getSnapshot()),
      [store],
    )
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    const [draft, setDraft] = useState(null)
    const [dragging, setDragging] = useState(false)
    const [error, setError] = useState(null)
    const trackRef = useRef(null)
    const draftRef = useRef(null)
    const draggingRef = useRef(false)
    const commitTimer = useRef(0)

    const setDraftIndex = (value) => {
      draftRef.current = value
      setDraft(value)
    }

    useEffect(() => {
      if (available) load()
    }, [available, load])

    const current = state.current
    const provider = current?.provider
    const modelId = current?.model
    const group = useMemo(
      () => state.groups.find((candidate) => candidate.id === provider),
      [state.groups, provider],
    )
    const model = useMemo(
      () => group?.models.find((candidate) => candidate.id === modelId),
      [group, modelId],
    )
    const reasoning = model?.reasoning
    const stops = useMemo(
      () => buildStops(reasoning, t('defaultStop')),
      [reasoning, t],
    )
    const pendingSameModel =
      state.pending !== null &&
      current !== null &&
      state.pending.provider === current.provider &&
      state.pending.model === current.model
    const projected = pendingSameModel ? state.pending : current
    const effectiveEffort = projected?.reasoningEffort ?? reasoning?.defaultEffort
    const index = stopIndexOf(stops, effectiveEffort)
    const usable = available && store !== undefined && stops.length >= 2
    const activeIndex = Math.min(stops.length - 1, Math.max(0, draft ?? index))
    const currentStop = stops[activeIndex]
    const pending = state.status === 'selecting'
    const position = positionOf(activeIndex, stops.length)

    // A new model or a settled selection starts a fresh gesture.
    useEffect(() => {
      draftRef.current = null
      setDraft(null)
    }, [provider, modelId, index])

    // CSS hides the native effort caption/menu only while a usable slider exists.
    useEffect(() => {
      if (!usable) return undefined
      return acquireSliderMarker()
    }, [usable])

    useEffect(
      () => () => {
        if (commitTimer.current !== 0) clearTimeout(commitTimer.current)
      },
      [],
    )

    const commit = useCallback(
      async (nextIndex) => {
        if (!usable || provider === undefined || modelId === undefined) return
        const stop = stops[nextIndex]
        if (stop === undefined || stop.id === effectiveEffort) return
        setError(null)
        setDraftIndex(null)
        try {
          const result = await select({
            provider,
            model: modelId,
            ...(stop.id === undefined ? {} : { reasoningEffort: stop.id }),
          })
          if (result !== undefined && result.ok === false) {
            setError(result.error?.message ?? t('error'))
          }
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : String(failure))
        }
      },
      [usable, provider, modelId, stops, effectiveEffort, select, t],
    )

    const indexFromX = (clientX) => {
      const track = trackRef.current
      if (track === null) return activeIndex
      const rect = track.getBoundingClientRect()
      const inset = 6
      const width = Math.max(1, rect.width - inset * 2)
      const x = Math.min(width, Math.max(0, clientX - rect.left - inset))
      return Math.round((x / width) * (stops.length - 1))
    }

    const handlePointerDown = (event) => {
      if (!usable || event.button !== 0) return
      event.preventDefault()
      event.currentTarget.focus()
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Synthetic events and some embedded browsers have no active pointer.
      }
      draggingRef.current = true
      setDragging(true)
      setDraftIndex(indexFromX(event.clientX))
    }

    const handlePointerMove = (event) => {
      if (!draggingRef.current) return
      setDraftIndex(indexFromX(event.clientX))
    }

    const finishPointer = (event) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      const next = indexFromX(event.clientX)
      setDraftIndex(next)
      setDragging(false)
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // Releasing a non-captured pointer is harmless.
      }
      void commit(next)
    }

    const handlePointerCancel = () => {
      draggingRef.current = false
      setDragging(false)
      draftRef.current = null
      setDraft(null)
      if (commitTimer.current !== 0) {
        clearTimeout(commitTimer.current)
        commitTimer.current = 0
      }
    }

    const scheduleCommit = (next) => {
      if (commitTimer.current !== 0) clearTimeout(commitTimer.current)
      commitTimer.current = setTimeout(() => {
        commitTimer.current = 0
        void commit(next)
      }, 160)
    }

    const handleKeyDown = (event) => {
      if (!usable || event.altKey || event.ctrlKey || event.metaKey) return
      let next = activeIndex
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = Math.min(stops.length - 1, activeIndex + 1)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          next = Math.max(0, activeIndex - 1)
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = stops.length - 1
          break
        default:
          return
      }
      event.preventDefault()
      setDraftIndex(next)
      scheduleCommit(next)
    }

    const handleKeyUp = (event) => {
      if (!['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
      if (commitTimer.current === 0) return
      clearTimeout(commitTimer.current)
      commitTimer.current = 0
      void commit(draftRef.current ?? activeIndex)
    }

    const handleBlur = () => {
      if (commitTimer.current === 0) return
      clearTimeout(commitTimer.current)
      commitTimer.current = 0
      void commit(draftRef.current ?? activeIndex)
    }

    if (!usable || currentStop === undefined) return null

    return createElement(
      'div',
      {
        className: 'rls-slider',
        'data-rls-slider': '',
        'data-dragging': dragging ? '' : undefined,
        'data-pending': pending ? '' : undefined,
        'data-error': error === null ? undefined : '',
        title: error ?? `${t('sliderAria')}: ${currentStop.name}`,
      },
      createElement(
        'span',
        { className: 'rls-current', key: 'current', 'aria-hidden': 'true' },
        capitalizeFirst(currentStop.name),
      ),
      createElement(
        'div',
        {
          key: 'track',
          ref: trackRef,
          className: 'rls-track',
          role: 'slider',
          tabIndex: 0,
          'aria-valuemin': 0,
          'aria-valuemax': stops.length - 1,
          'aria-valuenow': activeIndex,
          'aria-valuetext': currentStop.name,
          'aria-label': t('sliderAria'),
          'aria-busy': pending ? true : undefined,
          'aria-invalid': error === null ? undefined : true,
          style: { '--rls-pos': String(position) },
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: finishPointer,
          onPointerCancel: handlePointerCancel,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          onBlur: handleBlur,
        },
        createElement('span', { className: 'rls-fill', key: 'fill' },
          createElement('span', { className: 'rls-sheen', key: 'sheen' }),
          ...METEORS.map((meteor, meteorIndex) =>
            createElement('span', {
              key: `meteor-${meteorIndex}`,
              className: 'rls-meteor',
              'aria-hidden': 'true',
              style: {
                top: meteor.top,
                width: `${meteor.length}px`,
                animationDelay: `${meteor.delay}s`,
              },
            }),
          ),
        ),
        createElement('span', { className: 'rls-aura', key: 'aura', 'aria-hidden': 'true' }),
        createElement('span', { className: 'rls-thumb', key: 'thumb' }),
      ),
    )
  }

  /**
   * Install the plugin's Cordis client half.
   * @param {object} ctx - Client plugin context.
   * @returns {void}
   */
  function apply(ctx) {
    if (typeof document === 'undefined') return
    const doc = document

    ctx.effect(
      () => ctx.locale.register(NS, { zh: ZH, en: EN }),
      `${PLUGIN_ID}: dictionaries`,
    )

    ctx.effect(
      () => installStyle(doc, cssText),
      `${PLUGIN_ID}: styles`,
    )

    ctx.slots.inject('conversation.input.right', () =>
      ctx.slots.register(
        {
          name: 'conversation.input.right',
          id: 'reasoning-effort-slider',
          order: 20,
          locale: NS,
          inject: (sessionId) => {
            if (sessionId === undefined) return { available: false }
            try {
              if (ctx.sessions.subagentAddress(sessionId) !== undefined) {
                return { available: false }
              }
              const directory = ctx.modelDirectories.directoryFor(sessionId)
              return {
                available: true,
                store: directory.store,
                load: () => {
                  try {
                    directory.load().catch(() => {})
                  } catch {
                    // A disposed session scope makes the directory unavailable.
                  }
                },
                select: async (selection) => {
                  try {
                    return await directory.select(selection)
                  } catch (failure) {
                    return {
                      ok: false,
                      error: {
                        code: 'better-reasoning-effort/select-failed',
                        message: failure instanceof Error ? failure.message : String(failure),
                      },
                    }
                  }
                },
              }
            } catch {
              return { available: false }
            }
          },
        },
        EffortSlider,
      ),
    )
  }

  return {
    // `directoryFor()` resolves the model directory's `remote.session` face
    // through the caller's inject, so the two remote services are required here
    // even though this plugin never reads them directly.
    inject: ['slots', 'locale', 'modelDirectories', 'sessions', 'remote', 'remote.session'],
    apply,
  }
}

/**
 * Install the stylesheet, replacing a stale copy from a previous fiber.
 * @param {Document} doc - Browser document.
 * @param {string} cssText - Stylesheet contents.
 * @returns {() => void} Disposer that removes the style element.
 */
function installStyle(doc, cssText) {
  const selector = `style[data-plugin-css="${STYLE_TAG_ID}"]`
  for (const stale of doc.querySelectorAll(selector)) stale.remove()
  const style = doc.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_TAG_ID
  style.textContent = cssText
  const parent = doc.head ?? doc.documentElement
  if (parent === null) throw new Error(`${PLUGIN_ID}: no document head to install the stylesheet`)
  parent.append(style)
  return () => style.remove()
}

		const __React__ = require("react");
		const __plugin = createPlugin(__RLS_CSS__, __React__);
		exports.inject = __plugin.inject;
		exports.apply = __plugin.apply;
		return module.exports;
	}
});
