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
export function buildStops(reasoning, defaultLabel) {
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
export function stopIndexOf(stops, effort) {
  const index = stops.findIndex((stop) => stop.id === effort)
  return index < 0 ? 0 : index
}

/**
 * Position of one stop on the 0..1 track.
 * @param {number} index - Stop index.
 * @param {number} count - Number of stops.
 * @returns {number} Fraction in [0, 1]; a single stop sits at the center.
 */
export function positionOf(index, count) {
  if (!Number.isFinite(index) || !Number.isFinite(count) || count <= 1) return 0.5
  return Math.min(1, Math.max(0, index / (count - 1)))
}

/**
 * Capitalize the first letter of a level name without changing the rest.
 * @param {unknown} value - Adapter effort name.
 * @returns {string} Display text such as "High" or "Extra high".
 */
export function capitalizeFirst(value) {
  const text = String(value ?? '')
  return text === '' ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Build the plugin with its stylesheet and the host-provided React runtime.
 * @param {string} cssText - Stylesheet contents for the plugin lifetime.
 * @param {object} React - Host React module (hooks and createElement).
 * @returns {{ inject: string[], apply: (ctx: object) => void }} Cordis client plugin.
 */
export function createPlugin(cssText, React) {
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
